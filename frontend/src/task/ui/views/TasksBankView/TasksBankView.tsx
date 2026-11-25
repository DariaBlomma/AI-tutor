import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TasksBankService } from '@/task/services/TasksBankService';
import { useTasksBank } from '@/task/hooks/useTasksBank';
import { useTaskRefs } from '@/task/hooks/useTaskRefs';
import { Pagination } from '@/shared/ui-kit/Pagination/Pagination';
import { LoadingWidget } from '@/shared/ui-kit/Loader/LoadingWidget';
import { useTeacherCourses } from '@/teacher/hooks/useTeacherCourses';
import { TaskBulkActionsBar } from '@/task/ui/widgets/TaskBulkActionsBar/TaskBulkActionsBar.tsx';
import { TaskDeletePopup } from '@/task/ui/widgets/TaskDeletePopup/TaskDeletePopup';
import { TaskAssignPopup } from '@/task/ui/widgets/TaskAssignPopup/TaskAssignPopup';
import { TaskCoursePopup } from '@/task/ui/widgets/TaskCoursePopup/TaskCoursePopup';
import { TaskCard } from './TaskCard';
import { FilterIcon } from './FilterIcon';
import type { TasksBulkAction } from '@/task/types';
import type { CefrLevel, ExamType, ItemType, TaskSummary } from '@/task/types';
import { TasksBankFilters } from '../../widgets/TasksBankFilters';
import styles from './TasksBankView.module.scss';

const SEARCH_DEBOUNCE_MS = 300;

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
    const [bulkAction, setBulkAction] = useState<TasksBulkAction | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    // Токен для принудительного пересоздания TaskStudentsBadge (key) после bulk-назначения.
    const [assignmentsReloadToken, setAssignmentsReloadToken] = useState(0);

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

    // Закрытие любой bulk-модалки (Esc / клик вне / «Отмена» / успех) снимает выбор — панель исчезает вместе с ним.
    const closeBulkAction = useCallback(() => {
        setBulkAction(null);
        clearSelection();
    }, [clearSelection]);

    // Поиск: input обновляется сразу, запрос — с дебаунсом.
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [grammarTypeId, setGrammarTypeId] = useState<number | null>(null);
    const [itemType, setItemType] = useState<ItemType | null>(null);
    const [levels, setLevels] = useState<CefrLevel[]>([]);
    const [examType, setExamType] = useState<ExamType | null>(null);
    const [topicId, setTopicId] = useState<number | null>(null);
    // Фильтр по курсам (мультиселект BaseSelectMulti — та же react-select, что сингл-селекты).
    // Значение храним строками (value селекта), в запрос конвертируем в number[].
    const [courseIdsFilter, setCourseIdsFilter] = useState<string[]>([]);
    // Галочка «Включать смешанные задания»: по умолчанию выключена — совпадает с дефолтом
    // бэкенда (TaskController: includeMixed=false). Разница состояний теперь видна сразу.
    const [includeMixed, setIncludeMixed] = useState(false);

    // Mobile filter sidebar toggle
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Смена фильтра возвращает на первую страницу: иначе при галочке/фильтре остаётся
    // старый page, а новых страниц может не быть — бэк отдаёт пустую страницу, UI выглядит сломанным.
    // Скролл при этом НЕ трогаем: пользователь кликнул чип/галочку там, где ему удобно
    // (обычно в блоке фильтров или у пагинации внизу) — прыжок в начало только мешает.
    const applyFilter = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value);
        setPage(0);
    };
    const changeGrammarType = applyFilter(setGrammarTypeId);
    const changeItemType = applyFilter(setItemType);
    const changeLevels = applyFilter(setLevels);
    const changeExamType = applyFilter(setExamType);
    const changeTopic = applyFilter(setTopicId);
    const changeIncludeMixed = applyFilter(setIncludeMixed);
    // Мультиселект курсов: тот же сброс на первую страницу, что у остальных фильтров.
    const changeCourseIds = applyFilter(setCourseIdsFilter);

    // Глобальный сброс всех фильтров.
    const clearAllFilters = useCallback(() => {
        setGrammarTypeId(null);
        setItemType(null);
        setLevels([]);
        setExamType(null);
        setTopicId(null);
        setCourseIdsFilter([]);
        setIncludeMixed(false);
        setPage(0);
    }, []);

    const applySearch = (value: string) => {
        setSearchInput(value);
        setPage(0);
        window.setTimeout(() => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS);
    };

    // Позиция скролла на момент смены состояния загрузки (для возврата после загрузки новой страницы).
    const scrollPosOnPageChange = useRef<number | null>(null);

    const fetcher = useCallback(
        (page: number, size: number) =>
            TasksBankService.getTasks({
                search: debouncedSearch.trim() || undefined,
                taskTypeId: grammarTypeId ?? undefined,
                itemType: itemType ?? undefined,
                levels: levels.length ? levels : undefined,
                examType: examType ?? undefined,
                // Фильтр по курсам: пустой мультиселект = не применять (undefined), иначе number[].
                courseIds: courseIdsFilter.length ? courseIdsFilter.map(Number) : undefined,
                includeMixed,
                page,
                size,
            }),
        [debouncedSearch, grammarTypeId, itemType, levels, examType, courseIdsFilter, includeMixed],
    );

    const { pageItems, totalCount, totalPages, page, setPage, isLoading, isError, error, reload } = useTasksBank(fetcher);

    // Карточки выбранных заданий (для bulk-модалок): selectedIds сохраняются между страницами
    // и фильтрами, но объекты берём из текущей страницы — вне её карточек у нас нет.
    const selectedTasks = useMemo(
        () => pageItems.filter((task) => selectedIds.has(task.id)),
        [pageItems, selectedIds],
    );

    // Данные для финальных bulk-модалок: назначение (id + name) и добавление в курс (только id).
    const bulkAssignTargets = useMemo(
        () => selectedTasks.map((task) => ({ id: task.id, name: task.name })),
        [selectedTasks],
    );
    const bulkTaskIds = useMemo(() => selectedTasks.map((task) => task.id), [selectedTasks]);

    // Перезагрузка назначений для выбранных заданий после bulk-назначения.
    // Инкремент токена заставляет TaskStudentsBadge пересоздаться (через key)
    // и make новый запрос GET /tasks/{id}/assignments.
    const handleAssignSuccess = useCallback(async () => {
        setAssignmentsReloadToken((t) => t + 1);
    }, []);

    // Актуальность списка после возврата со страницы редактирования/удаления: fetcher стабилен
    // при неизменных фильтрах, effect выполнится один раз на монтирование экрана.
    // ВАЖНО: reload обязан быть стабильной ссылкой (в хуке — useCallback), иначе этот эффект
    // сам же и менял бы свои deps → бесконечный цикл «запрос → перезагрузка».
    useEffect(() => {
        reload();
    }, [reload, fetcher]);

    // Смена страницы (пагинация): сохраняем позицию скролла — кнопки остаются под
    // списком там же, куда пользователь уже дотянулся; прыжок в верх только мешает.
    const changePage = useCallback(
        (nextPage: number) => {
            if (nextPage === page || nextPage < 0 || nextPage > totalPages - 1) return;
            setPage(nextPage);
        },
        [page, setPage, totalPages],
    );

    // Если загрузка новой страницы/фильтра всё же сместила страницу (изменилась высота
    // списка) — мгновенно возвращаем позицию. Значение запоминаем на каждом изменении
    // isLoading: при смене фильтра запрос стартует в том же рендере, что и клик, поэтому
    // отдельный capture по page тут не сработал бы.
    useEffect(() => {
        if (isLoading) {
            scrollPosOnPageChange.current = window.scrollY;
            return;
        }
        const target = scrollPosOnPageChange.current;
        scrollPosOnPageChange.current = null;
        if (target != null && Math.abs(target - window.scrollY) > 4) {
            window.scrollTo({ top: target, behavior: 'instant' });
        }
    }, [isLoading]);

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

    // Курсы учителя для фильтра-мультиселекта (GET /api/courses) — только учителю.
    const teacherCourses = useTeacherCourses(true);
    const { createCourse } = teacherCourses;
    const courseOptions = useMemo(
        () => teacherCourses.courses.map((c) => ({ value: String(c.id), label: c.name })),
        [teacherCourses.courses],
    );

    // Клиентский добор по теме (серверного фильтра topicId нет).
    const visibleTasks = useMemo(
        () => (topicId == null ? pageItems : pageItems.filter((t) => t.topics.some((topic) => topic.id === topicId))),
        [pageItems, topicId],
    );

    // Map id → name всех курсов учителя для отображения чипов.
    const courseMap = useMemo(
        () => new Map(teacherCourses.courses.map((c) => [c.id, c.name])),
        [teacherCourses.courses],
    );

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Банк заданий</h1>
                <div className={styles.headerRow}>
                    <button
                        type="button"
                        className={styles.filterToggleBtn}
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        aria-label="Фильтры"
                        aria-expanded={filtersOpen}
                    >
                        <FilterIcon />
                    </button>
                    {isTeacher && (
                        <Link to="/tasks-bank/create" className={styles.createBtn}>
                            Создать задание
                        </Link>
                    )}
                </div>
            </div>

            {/* Поиск */}
            <input
                type="text"
                className={styles.searchInput}
                placeholder="Поиск по названию или public id"
                value={searchInput}
                onChange={(e) => applySearch(e.target.value)}
            />

            {/* Mobile overlay */}
            {filtersOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setFiltersOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className={styles.content}>
                <aside className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ''}`}>
                    <TasksBankFilters
                    grammarTypes={refs.grammarTypes}
                    topicsForFilter={topicsForFilter}
                    grammarTypeId={grammarTypeId}
                    itemType={itemType}
                    levels={levels}
                    examType={examType}
                    topicId={topicId}
                    courseIdsFilter={courseIdsFilter}
                    includeMixed={includeMixed}
                    courseOptions={courseOptions}
                    teacherCoursesLoading={teacherCourses.isLoading}
                    onCreateCourse={createCourse}
                    onChangeGrammarType={changeGrammarType}
                    changeItemType={changeItemType}
                    changeLevels={changeLevels}
                    changeExamType={changeExamType}
                    changeTopic={changeTopic}
                    changeCourseIds={changeCourseIds}
                    changeIncludeMixed={changeIncludeMixed}
                    onClearAll={isTeacher ? clearAllFilters : undefined}
                    manageGrammarTypesTo={isTeacher ? '/tasks-bank/grammar-types' : undefined}
                    manageTopicsTo={isTeacher ? '/tasks-bank/topics' : undefined}
                />
                </aside>

                <section className={styles.tasksSection}>
                    {(isError || error) && <div className={styles.error}>{error ?? 'Не удалось загрузить банк заданий.'}</div>}
                    {actionError && <div className={styles.error}>{actionError}</div>}

                    {!isError && !isLoading && !visibleTasks.length && (
                        <div className={styles.notice}>Заданий по выбранным фильтрам нет.</div>
                    )}

                    {/* Загрузка: спиннер-оверлей поверх всего списка (LoadingWidget mode="overlay") —
                        карточки остаются на месте, страница не «прыгает» высотой; затемнение и блокировка
                        кликов живут в подложке оверлея (раньше — opacity у .list). Короткие ответы
                        (<150 мс) спиннер не показывают вовсе. */}
                    {!isError && (
                        <LoadingWidget active={isLoading} mode="overlay" dimContent>
                            <div className={styles.list} aria-busy={isLoading}>
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
                                        courseMap={courseMap}
                                        assignmentsReloadToken={assignmentsReloadToken}
                                    />
                                ))}
                            </div>
                        </LoadingWidget>
                    )}

                    {/* Постраничная навигация (серверная пагинация — GET /api/tasks?page&size) */}
                    {!isError && totalPages >= 1 && (
                        <Pagination page={page} totalPages={totalPages} totalCount={totalCount} onPageChange={changePage} />
                    )}
                </section>
            </div>

            {/* Bulk-действия: без промежуточного подтверждения — кнопка панели сразу открывает
                финальную модалку (назначение ученикам / добавление в курс). Любое закрытие
                (Esc, клик вне, «Отмена», успех) снимает выбор через closeBulkAction. */}
            {bulkAction === 'assign' && (
                <TaskAssignPopup open onClose={closeBulkAction} tasks={bulkAssignTargets} onAssignSuccess={handleAssignSuccess} />
            )}
            {bulkAction === 'to-course' && (
                <TaskCoursePopup
                    open
                    onClose={closeBulkAction}
                    taskIds={bulkTaskIds}
                    tasksHint={`Выбрано заданий: ${bulkTaskIds.length}`}
                    onAdded={closeBulkAction}
                />
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

            {/* Панель массовых действий — рендерится вне .page, чтобы position: fixed
                работала на десктопе (иначе клиппируется overflow: hidden у .page). */}
            {selectedIds.size > 0 && (
                <TaskBulkActionsBar selectedCount={selectedIds.size} onAction={setBulkAction} onClose={closeBulkAction} />
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
