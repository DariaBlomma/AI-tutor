import { useCallback, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import { useTasksBank } from '@/tasks/hooks/useTasksBank';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { ChipsMultiselect } from '@/tasks/ui/widgets/ChipsMultiselect/ChipsMultiselect';
import { BulkActionsBar } from '@/tasks/ui/widgets/BulkActionsBar/BulkActionsBar';
import { TasksBulkPopup } from '@/tasks/ui/widgets/TasksBulkPopup/TasksBulkPopup';
import type { BulkAction } from '@/tasks/ui/widgets/TasksBulkPopup/types';
import { ITEM_TYPE_OPTIONS } from '@/tasks/types';
import type { ChipItem } from '@/tasks/ui/widgets/ChipsMultiselect/types';
import type { ItemType, TaskSummary } from '@/tasks/types';
import styles from './TasksBankView.module.scss';

const SEARCH_DEBOUNCE_MS = 300;

// Чипы механик (enum ItemType) — фиксированный список, id числовые для общего виджета чипов.
const MECHANIC_ITEMS: ChipItem[] = ITEM_TYPE_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const MECHANIC_BY_ID = new Map(MECHANIC_ITEMS.map((c, i) => [c.id, ITEM_TYPE_OPTIONS[i].value]));

// Подписи чипов механик в карточке задания (короткие, как в дизайне).
const MECHANIC_CHIP_LABELS: Record<ItemType, string> = {
    WORD_FORMATION: 'word formation',
    GAP_FILL: 'gap fill',
    TFNS: 'TFNS',
    MATCHING: 'matching',
};

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
    const [topicId, setTopicId] = useState<number | null>(null);
    const [includeMixed, setIncludeMixed] = useState(true);

    const applySearch = (value: string) => {
        setSearchInput(value);
        window.setTimeout(() => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS);
    };

    const fetcher = useCallback(
        (page: number, size: number) =>
            TasksBankService.getTasks({
                search: debouncedSearch.trim() || undefined,
                taskTypeId: grammarTypeId ?? undefined,
                itemType: itemType ?? undefined,
                includeMixed,
                page,
                size,
            }),
        [debouncedSearch, grammarTypeId, itemType, includeMixed],
    );

    const { pageItems, totalCount, totalPages, page, setPage, isLoading, isError, error, reload } = useTasksBank(fetcher);

    // Удаление задания (только владелец): confirm -> DELETE /api/tasks/{id} -> перезагрузка страницы.
    const handleDelete = useCallback(
        async (task: TaskSummary) => {
            if (!window.confirm(`Удалить задание «${task.name?.trim() || task.publicId}»?`)) return;
            setDeletingId(task.id);
            setActionError(null);
            try {
                await TasksBankService.deleteTask(task.id);
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(task.id);
                    return next;
                });
                reload();
            } catch (e) {
                setActionError(e instanceof Error ? e.message : 'Не удалось удалить задание.');
            } finally {
                setDeletingId(null);
            }
        },
        [reload],
    );


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
                    onChange={(ids) => setGrammarTypeId(ids[0] ?? null)}
                    onClear={() => setGrammarTypeId(null)}
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
                    onChange={(ids) => setTopicId(ids[0] ?? null)}
                    onClear={() => setTopicId(null)}
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
                    onChange={(ids) => setItemType(ids.length ? (MECHANIC_BY_ID.get(ids[0]) ?? null) : null)}
                    onClear={() => setItemType(null)}
                    clearLabel="Все"
                />
            </div>

            {/* Смешанные задания */}
            <label className={styles.mixedToggle}>
                <input type="checkbox" checked={includeMixed} onChange={(e) => setIncludeMixed(e.target.checked)} />
                <span>Включать смешанные задания</span>
            </label>

            {(isError || error) && <div className={styles.notice}>{error ?? 'Не удалось загрузить банк заданий.'}</div>}
            {actionError && <div className={styles.notice}>{actionError}</div>}

            {!isLoading && !isError && !visibleTasks.length && (
                <div className={styles.notice}>Заданий по выбранным фильтрам нет.</div>
            )}

            {!isLoading && !isError && (
                <div className={styles.list}>
                    {visibleTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            selectable={isTeacher}
                            selected={selectedIds.has(task.id)}
                            canManage={isTeacher && task.createdById != null && task.createdById === currentUserId}
                            deleting={deletingId === task.id}
                            onToggleSelect={toggleSelect}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Постраничная навигация (серверная пагинация — GET /api/tasks?page&size) */}
            {!isLoading && !isError && totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}

            {/* Панель массовых действий — только учителю и только при выбранном > 0. */}
            {isTeacher && selectedIds.size > 0 && (
                <BulkActionsBar selectedCount={selectedIds.size} onAction={setBulkAction} />
            )}
            {isTeacher && (
                <TasksBulkPopup action={bulkAction} selectedCount={selectedIds.size} onClose={closeBulkPopup} />
            )}
        </div>
    );
}

// Типичная пагинация: в начало / назад / номера страниц / вперёд / в конец.
function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i);

    return (
        <nav className={styles.pagination} aria-label="Пагинация">
            <button type="button" className={styles.pageBtn} onClick={() => onPageChange(0)} disabled={page === 0} title="В начало">
                ⇤
            </button>
            <button type="button" className={styles.pageBtn} onClick={() => onPageChange(page - 1)} disabled={page === 0}>
                ←
            </button>
            {pages.map((p) => (
                <button
                    key={p}
                    type="button"
                    className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                    onClick={() => onPageChange(p)}
                >
                    {p + 1}
                </button>
            ))}
            <button type="button" className={styles.pageBtn} onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
                →
            </button>
            <button
                type="button"
                className={styles.pageBtn}
                onClick={() => onPageChange(totalPages - 1)}
                disabled={page >= totalPages - 1}
                title="В конец"
            >
                ⇥
            </button>
        </nav>
    );
}

// Для ученика: темы берутся из карточек (GET /topics ему закрыт).
function collectTopics(tasks: TaskSummary[]) {
    const byId = new Map<number, { id: number; name: string }>();
    tasks.forEach((task) => task.topics.forEach((topic) => byId.set(topic.id, topic)));
    return [...byId.values()];
}

// Карточка задания — отображение + действия владельца (удаление).
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
}: {
    task: TaskSummary;
    selectable: boolean;
    selected: boolean;
    canManage: boolean;
    deleting: boolean;
    onToggleSelect: (id: number) => void;
    onDelete: (task: TaskSummary) => void;
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
                    {/* TODO: страница детального просмотра ещё не создана — ссылка появится вместе с роутом. */}
                    <span className={styles.publicId}>{task.publicId}</span>
                </div>

                {task.previewText && <div className={styles.preview}>{task.previewText}</div>}

                <div className={styles.tags}>
                    {task.taskTypes.map((type) => (
                        <span key={`tt-${type.id}`} className={styles.tag}>
                            {type.name}
                        </span>
                    ))}
                    {task.topics.map((topic) => (
                        <span key={`tp-${topic.id}`} className={styles.tag}>
                            {topic.name}
                        </span>
                    ))}
                    {(task.itemTypes ?? []).map((mechanic) => (
                        <span key={`mt-${mechanic}`} className={styles.tag}>
                            {MECHANIC_CHIP_LABELS[mechanic]}
                        </span>
                    ))}
                    {task.isMixed && <span className={`${styles.tag} ${styles.mixedTag}`}>Mixed</span>}
                </div>

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
