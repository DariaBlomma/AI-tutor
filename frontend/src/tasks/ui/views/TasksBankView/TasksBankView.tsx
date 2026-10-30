import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import { useTasksBank } from '@/tasks/hooks/useTasksBank';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { Pagination } from '@/shared/ui-kit/Pagination/Pagination';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { ChipsMultiselect } from '@/tasks/ui/widgets/ChipsMultiselect/ChipsMultiselect';
import { BulkActionsBar } from '@/tasks/ui/widgets/BulkActionsBar/BulkActionsBar';
import { TaskDeletePopup } from '@/tasks/ui/widgets/TaskDeletePopup/TaskDeletePopup';
import { TasksBulkPopup } from '@/tasks/ui/widgets/TasksBulkPopup/TasksBulkPopup';
import { TaskPreviewChips } from '@/tasks/ui/widgets/TaskPreviewChips/TaskPreviewChips';
import type { BulkAction } from '@/tasks/ui/widgets/TasksBulkPopup/types';
import { CEFR_LEVEL_OPTIONS, EXAM_TYPE_OPTIONS, ITEM_TYPE_OPTIONS } from '@/tasks/types';
import type { ChipItem } from '@/tasks/ui/widgets/ChipsMultiselect/types';
import type { CefrLevel, ExamType, ItemType, TaskSummary } from '@/tasks/types';
import styles from './TasksBankView.module.scss';

const SEARCH_DEBOUNCE_MS = 300;

// Чипы механик (enum ItemType) — фиксированный список, id числовые для общего виджета чипов.
const MECHANIC_ITEMS: ChipItem[] = ITEM_TYPE_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const MECHANIC_BY_ID = new Map(MECHANIC_ITEMS.map((c, i) => [c.id, ITEM_TYPE_OPTIONS[i].value]));

// Чипы уровня CEFR (enum CefrLevel A1..C1) и экзамена (enum ExamType: ОГЭ/ЕГЭ) — тоже фиксированные списки.
const LEVEL_ITEMS: ChipItem[] = CEFR_LEVEL_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const LEVEL_BY_ID = new Map(LEVEL_ITEMS.map((c, i) => [c.id, CEFR_LEVEL_OPTIONS[i].value]));
const EXAM_ITEMS: ChipItem[] = EXAM_TYPE_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const EXAM_BY_ID = new Map(EXAM_ITEMS.map((c, i) => [c.id, EXAM_TYPE_OPTIONS[i].value]));

// Страница «Банк заданий» — общая для учителя и ученика:
// список и фильтры видят все авторизованные; кнопки создания — только учителю.
// Фильтры: поиск (name/publicId), грамматический тип и пагинация — серверные (GET /api/tasks);
// темы — временный клиентский фильтр в пределах страницы (на бэке эндпоинта topicId пока нет).
// Управление справочниками (создание/редактирование/удаление) — на отдельных страницах
// /tasks-bank/topics и /tasks-bank/grammar-types (кнопка «+» у чипов, только учитель).
export function TasksBankView() {
    const isTeacher = AuthService.getUserRole() === 'TEACHER';
    // Действия с заданием (удаление) доступны только владельцу — бэк это же проверяет (403).
    const currentUserId = AuthService.getUserId();

    // Множественный выбор карточек (чекбоксы — только учителю) для bulk-действий.
    // Выбор сохраняется между страницами и фильтрами; очистка — при закрытии модалки или удалении задания.
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Подтверждение удаления — компактный попап рядом с кнопкой «Удалить» (вместо нативного confirm).
    // Позиционирование по кнопке-якорю берёт на себя Radix Popover (virtual ref + flip/shift).
    // Якорь — конкретная кнопка кликнувшей карточки: ref собираем через callback в Map по id задания
    // (общий ref на все карточки указывал бы всегда на последнюю отрендеренную кнопку).
    const [deleteTarget, setDeleteTarget] = useState<TaskSummary | null>(null);
    const deleteBtnRefs = useRef(new Map<number, HTMLButtonElement>());

    const setDeleteBtnRef = useCallback(
        (taskId: number) => (el: HTMLButtonElement | null) => {
            if (el) deleteBtnRefs.current.set(taskId, el);
            else deleteBtnRefs.current.delete(taskId);
        },
        [],
    );

    const getDeleteAnchor = useCallback(
        (taskId: number): DOMRect | null => {
            const el = deleteBtnRefs.current.get(taskId);
            return el ? el.getBoundingClientRect() : null;
        },
        [],
    );

    // Закрытие попапа удаления (клик вне / Esc / «Отмена»).
    const closeDeletePopup = useCallback(() => setDeleteTarget(null), []);

    const openDeletePopup = useCallback((task: TaskSummary) => {
        // Попап открываем только если кнопка этой карточки на месте (якорь найден в Map по id).
        if (deleteBtnRefs.current.has(task.id)) setDeleteTarget(task);
    }, []);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

    // Закрытие модалки снимает выбор (панель исчезает вместе с ним).
    const closeBulkPopup = useCallback(() => {
        setBulkAction(null);
        clearSelection();
    }, [clearSelection]);

    // Поиск: input обновляется сразу, запрос — с дебаунсом.
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [grammarTypeId, setGrammarTypeId] = useState<number | null>(null);
    const [itemType, setItemType] = useState<ItemType | null>(null);
    const [level, setLevel] = useState<CefrLevel | null>(null);
    const [examType, setExamType] = useState<ExamType | null>(null);
    const [topicId, setTopicId] = useState<number | null>(null);
    // Галочка «Включать смешанные задания»: по умолчанию выключена — совпадает с дефолтом
    // бэкенда (TaskController: includeMixed=false). Разница состояний теперь видна сразу.
    const [includeMixed, setIncludeMixed] = useState(false);

    // Смена фильтра возвращает на первую страницу (сбрасывает и скролл-позицию списка):
    // иначе при галочке/фильтре остаётся старый page, а новых страниц может не быть —
    // бэк отдаёт пустую страницу, UI выглядит сломанным.
    const applyFilter = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value);
        setPage(0);
    };
    const changeGrammarType = applyFilter(setGrammarTypeId);
    const changeItemType = applyFilter(setItemType);
    const changeLevel = applyFilter(setLevel);
    const changeExamType = applyFilter(setExamType);
    const changeTopic = applyFilter(setTopicId);
    const changeIncludeMixed = applyFilter(setIncludeMixed);

    const applySearch = (value: string) => {
        setSearchInput(value);
        setPage(0);
        window.setTimeout(() => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS);
    };

    const fetcher = useCallback(
        (page: number, size: number) =>
            TasksBankService.getTasks({
                search: debouncedSearch.trim() || undefined,
                taskTypeId: grammarTypeId ?? undefined,
                itemType: itemType ?? undefined,
                levels: level ?? undefined,
                examType: examType ?? undefined,
                includeMixed,
                page,
                size,
            }),
        [debouncedSearch, grammarTypeId, itemType, level, examType, includeMixed],
    );

    const { pageItems, totalCount, totalPages, page, setPage, isLoading, isError, error, reload } = useTasksBank(fetcher);

    // Смена страницы: всегда запрашиваем данные и поднимаем список в начало (пагинация — под списком).
    const changePage = useCallback(
        (nextPage: number) => {
            if (nextPage === page || nextPage < 0 || nextPage > totalPages - 1) return;
            setPage(nextPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        [page, setPage, totalPages],
    );

    // Плавный подъём к началу списка при смене фильтра/галочки.
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [debouncedSearch, grammarTypeId, itemType, level, examType, includeMixed]);

    // Удаление задания (только владелец): подтверждение в попапе у кнопки -> DELETE /api/tasks/{id} -> перезагрузка страницы.
    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        const task = deleteTarget;
        setDeletingId(task.id);
        setActionError(null);
        try {
            await TasksBankService.deleteTask(task.id);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(task.id);
                return next;
            });
            setDeleteTarget(null);
            reload();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Не удалось удалить задание.');
        } finally {
            setDeletingId(null);
        }
    }, [deleteTarget, reload]);

    // Позиционирование, flip при нехватке места и слежение за скроллом/ресайзом — на Radix Popover.

    // Справочники нужны для фильтров.
    // Бэк закрывает GET /topics от STUDENT (403) — ученику берём только типы,
    // а темы собираем из карточек списка.
    const refs = useTaskRefs(isTeacher);
    const topicsForFilter = useMemo(
        () => (isTeacher ? refs.topics : collectTopics(pageItems)),
        [isTeacher, refs.topics, pageItems],
    );

    // Клиентский добор по теме (серверного фильтра topicId нет).
    const visibleTasks = useMemo(
        () => (topicId == null ? pageItems : pageItems.filter((t) => t.topics.some((topic) => topic.id === topicId))),
        [pageItems, topicId],
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerRow}>
                    <h1>Банк заданий</h1>
                    {isTeacher && (
                        <Link to="/tasks-bank/create" className={styles.createBtn}>
                            Создать задание
                        </Link>
                    )}
                </div>
                <p>{isLoading ? 'Загрузка…' : `${totalCount} заданий`}</p>
            </div>

            {/* Поиск */}
            <input
                type="text"
                className={styles.searchInput}
                placeholder="Поиск по названию или public id"
                value={searchInput}
                onChange={(e) => applySearch(e.target.value)}
            />

            {/* Фильтр по грамматическим типам (справочник /task-types) */}
            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Грамматические типы</div>
                <ChipsMultiselect
                    items={refs.grammarTypes}
                    selectedIds={grammarTypeId == null ? [] : [grammarTypeId]}
                    single
                    onChange={(ids) => changeGrammarType(ids[0] ?? null)}
                    onClear={() => changeGrammarType(null)}
                    clearLabel="Все типы"
                    manageTo={isTeacher ? '/tasks-bank/grammar-types' : undefined}
                />
            </div>

            {/* Фильтр по лексическим темам (клиентский — на бэке фильтра нет) */}
            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Лексические темы</div>
                <ChipsMultiselect
                    items={topicsForFilter}
                    selectedIds={topicId == null ? [] : [topicId]}
                    single
                    onChange={(ids) => changeTopic(ids[0] ?? null)}
                    onClear={() => changeTopic(null)}
                    clearLabel="Все темы"
                    manageTo={isTeacher ? '/tasks-bank/topics' : undefined}
                />
            </div>

            {/* Фильтр по механике пунктов (enum ItemType) — серверный */}
            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Механика пунктов</div>
                <ChipsMultiselect
                    items={MECHANIC_ITEMS}
                    selectedIds={itemType == null ? [] : [MECHANIC_ITEMS.findIndex((c) => MECHANIC_BY_ID.get(c.id) === itemType) + 1]}
                    single
                    onChange={(ids) => changeItemType(ids.length ? (MECHANIC_BY_ID.get(ids[0]) ?? null) : null)}
                    onClear={() => changeItemType(null)}
                    clearLabel="Все"
                />
            </div>

            {/* Фильтр по уровню языка (enum CefrLevel A1..C1) — серверный */}
            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Уровень языка</div>
                <ChipsMultiselect
                    items={LEVEL_ITEMS}
                    selectedIds={level == null ? [] : [LEVEL_ITEMS.findIndex((c) => LEVEL_BY_ID.get(c.id) === level) + 1]}
                    single
                    onChange={(ids) => changeLevel(ids.length ? (LEVEL_BY_ID.get(ids[0]) ?? null) : null)}
                    onClear={() => changeLevel(null)}
                    clearLabel="Все уровни"
                />
            </div>

            {/* Фильтр по типу экзамена (enum ExamType: ОГЭ / ЕГЭ) — серверный */}
            <div className={styles.filterBlock}>
                <div className={styles.filterLabel}>Экзамен</div>
                <ChipsMultiselect
                    items={EXAM_ITEMS}
                    selectedIds={examType == null ? [] : [EXAM_ITEMS.findIndex((c) => EXAM_BY_ID.get(c.id) === examType) + 1]}
                    single
                    onChange={(ids) => changeExamType(ids.length ? (EXAM_BY_ID.get(ids[0]) ?? null) : null)}
                    onClear={() => changeExamType(null)}
                    clearLabel="Все экзамены"
                />
            </div>

            {/* Смешанные задания: включена — в выдачу попадают задания с 2+ грамматическими типами,
                выключена — только «чистые» (один тип). Фильтр серверный (includeMixed). */}
            <label className={styles.mixedToggle}>
                <input type="checkbox" checked={includeMixed} onChange={(e) => changeIncludeMixed(e.target.checked)} />
                <span>Включать смешанные задания</span>
            </label>

            {(isError || error) && <div className={styles.notice}>{error ?? 'Не удалось загрузить банк заданий.'}</div>}
            {actionError && <div className={styles.notice}>{actionError}</div>}

            {/* Загрузка: спиннер над уже отрисованными карточками (список не исчезает целиком —
                иначе страница «прыгала» высотой на каждый запрос). Подпись у самого Loader. */}
            {isLoading && <Loader />}

            {!isError && !isLoading && !visibleTasks.length && (
                <div className={styles.notice}>Заданий по выбранным фильтрам нет.</div>
            )}

            {!isError && (
                <div className={`${styles.list} ${isLoading ? styles.listLoading : ''}`}>
                    {visibleTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            selectable={isTeacher}
                            selected={selectedIds.has(task.id)}
                            canManage={isTeacher && task.createdById != null && task.createdById === currentUserId}
                            deleting={deletingId === task.id}
                            onToggleSelect={toggleSelect}
                            onDelete={openDeletePopup}
                            registerDeleteBtn={setDeleteBtnRef}
                        />
                    ))}
                </div>
            )}

            {/* Постраничная навигация (серверная пагинация — GET /api/tasks?page&size) */}
            {!isError && totalPages >= 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
            )}

            {/* Панель массовых действий — только учителю и только при выбранном > 0. */}
            {isTeacher && selectedIds.size > 0 && (
                <BulkActionsBar selectedCount={selectedIds.size} onAction={setBulkAction} />
            )}
            {isTeacher && (
                <TasksBulkPopup action={bulkAction} selectedCount={selectedIds.size} onClose={closeBulkPopup} />
            )}

            {/* Попап подтверждения удаления — рядом с кнопкой «Удалить» (без полноэкранного затемнения). */}
            {deleteTarget && (
                <TaskDeletePopup
                    taskName={deleteTarget.name?.trim() || deleteTarget.publicId}
                    busy={deletingId === deleteTarget.id}
                    getAnchorRect={() => getDeleteAnchor(deleteTarget.id)}
                    open
                    onOpenChange={closeDeletePopup}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
}

// Для ученика: темы берутся из карточек (GET /topics ему закрыт).
function collectTopics(tasks: TaskSummary[]) {
    const byId = new Map<number, { id: number; name: string }>();
    tasks.forEach((task) => task.topics.forEach((topic) => byId.set(topic.id, topic)));
    return [...byId.values()];
}

// Карточка задания — отображение + действия владельца (удаление через попап-подтверждение).
// Дизайн: чекбокс слева (только учителю — bulk-выбор); в шапке название (заглушка «Без названия», если пустое)
// и справа сверху publicId как ссылка на детальную страницу; ниже — превью, затем общий ряд чипов
// (грамматические типы → темы → механики → Mixed), в футере количество позиций жирным.
// Пункт «Редактировать» временно не делаем (edit-режим формы — отдельная задача).
function TaskCard({
    task,
    selectable,
    selected,
    canManage,
    deleting,
    onToggleSelect,
    onDelete,
    registerDeleteBtn,
}: {
    task: TaskSummary;
    selectable: boolean;
    selected: boolean;
    canManage: boolean;
    deleting: boolean;
    onToggleSelect: (id: number) => void;
    onDelete: (task: TaskSummary) => void;
    // Регистрация кнопки «Удалить» этой карточки по id задания — виджет-попап берёт
    // координаты именно этой кнопки как якорь (общий ref на все карточки не подходит:
    // в него последовательно записывалась бы всегда кнопка последней отрендеренной карточки).
    registerDeleteBtn: (taskId: number) => (el: HTMLButtonElement | null) => void;
}) {
    return (
        <div className={`${styles.card} ${selected ? styles.cardSelected : ''}`}>
            {selectable && (
                <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selected}
                    onChange={() => onToggleSelect(task.id)}
                    aria-label={`Выбрать задание ${task.name ?? task.publicId}`}
                />
            )}

            <div className={styles.body}>
                <div className={styles.headerRow}>
                    <span className={styles.title}>{task.name?.trim() || 'Без названия'}</span>
                    {/* Ссылка на детальную страницу просмотра задания (роут /tasks-bank/$publicId). */}
                    <Link to="/tasks-bank/$publicId" params={{ publicId: task.publicId }} className={`${styles.publicId} ${styles.publicIdLink}`}>
                        {task.publicId}
                    </Link>
                </div>

                {task.previewText && (
                    <ol className={styles.previewList}>
                        {task.previewText.split('\n').map((line, i) => (
                            // Индекс стабильный (строки превью не меняются на месте) — ключ по номеру строки.
                            <li key={`pv-${i}`} className={styles.previewLine}>
                                {line.replace(/^\d+\.\s*/, '')}
                            </li>
                        ))}
                    </ol>
                )}

                {/* Чипы задания — общий компонент со страницей просмотра (TaskDetailView). */}
                <TaskPreviewChips
                    levels={task.levels}
                    examType={task.examType}
                    grammarTypes={task.taskTypes}
                    topics={task.topics}
                    itemTypes={task.itemTypes ?? []}
                    isMixed={task.isMixed}
                />

                <div className={styles.footer}>
                    <span className={styles.count}>
                        Позиций: <strong>{task.itemCount}</strong>
                    </span>
                    {canManage && (
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.actionBtn}
                                disabled
                                title="Редактирование будет доступно позже"
                            >
                                Редактировать
                            </button>
                            <button
                                ref={registerDeleteBtn(task.id)}
                                type="button"
                                className={`${styles.actionBtn} ${styles.dangerBtn}`}
                                disabled={deleting}
                                onClick={() => onDelete(task)}
                            >
                                {deleting ? 'Удаление…' : 'Удалить'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
