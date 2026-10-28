import { useCallback, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import { useTasksBank } from '@/tasks/hooks/useTasksBank';
import { useTaskRefs } from '@/tasks/hooks/useTaskRefs';
import { ChipsMultiselect } from '@/tasks/ui/widgets/ChipsMultiselect/ChipsMultiselect';
import { ITEM_TYPE_OPTIONS } from '@/tasks/types';
import type { ChipItem } from '@/tasks/ui/widgets/ChipsMultiselect/types';
import type { ItemType, TaskSummary } from '@/tasks/types';
import styles from './TasksBankView.module.scss';

const SEARCH_DEBOUNCE_MS = 300;

// Чипы механик (enum ItemType) — фиксированный список, id числовые для общего виджета чипов.
const MECHANIC_ITEMS: ChipItem[] = ITEM_TYPE_OPTIONS.map((o, i) => ({ id: i + 1, name: o.label }));
const MECHANIC_BY_ID = new Map(MECHANIC_ITEMS.map((c, i) => [c.id, ITEM_TYPE_OPTIONS[i].value]));

// Страница «Банк заданий» — общая для учителя и ученика:
// список и фильтры видят все авторизованные; кнопки создания — только учителю.
// Фильтры: поиск (name/publicId), грамматический тип и пагинация — серверные (GET /api/tasks);
// темы — временный клиентский фильтр в пределах страницы (на бэке эндпоинта topicId пока нет).
// Управление справочниками (создание/редактирование/удаление) — на отдельных страницах
// /tasks-bank/topics и /tasks-bank/grammar-types (кнопка «+» у чипов, только учитель).
export function TasksBankView() {
    const isTeacher = AuthService.getUserRole() === 'TEACHER';

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

    const { pageItems, totalCount, totalPages, page, setPage, isLoading, isError, error } = useTasksBank(fetcher);

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

            {!isLoading && !isError && !visibleTasks.length && (
                <div className={styles.notice}>Заданий по выбранным фильтрам нет.</div>
            )}

            {!isLoading && !isError && (
                <div className={styles.list}>
                    {visibleTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}

            {/* Постраничная навигация (серверная пагинация — GET /api/tasks?page&size) */}
            {!isLoading && !isError && totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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

// Карточка задания — только отображение (клики/действия будут позже).
function TaskCard({ task }: { task: TaskSummary }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardTop}>
                <span className={styles.cardName}>{task.name}</span>
                {task.isMixed && <span className={styles.mixedBadge}>Mixed</span>}
            </div>

            {task.publicId && <div className={styles.publicId}>{task.publicId}</div>}

            {task.previewText && <div className={styles.preview}>{task.previewText}</div>}

            <div className={styles.meta}>
                {task.taskTypes.map((type) => (
                    <span key={type.id} className={styles.metaChip}>
                        {type.name}
                    </span>
                ))}
                {task.topics.map((topic) => (
                    <span key={topic.id} className={`${styles.metaChip} ${styles.topicChip}`}>
                        {topic.name}
                    </span>
                ))}
            </div>

            <div className={styles.count}>Позиций: {task.itemCount}</div>
        </div>
    );
}
