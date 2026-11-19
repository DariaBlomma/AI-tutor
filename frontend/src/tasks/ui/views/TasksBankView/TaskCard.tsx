import { Link } from '@tanstack/react-router';
import { TaskPreviewChips } from '@/tasks/ui/widgets/TaskPreviewChips/TaskPreviewChips';
import { TaskStudentsBadge } from '@/tasks/ui/widgets/TaskStudentsBadge/TaskStudentsBadge';
import type { TaskSummary } from '@/tasks/types';
import styles from './TasksBankView.module.scss';

interface TaskCardProps {
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
    // Map id → name всех курсов учителя для отображения чипов.
    courseMap: Map<number, string>;
}

// Карточка задания — отображение + действия владельца (удаление через попап-подтверждение).
// Дизайн: чекбокс слева (только учителю — bulk-выбор); в шапке название (заглушка «Без названия», если пустое)
// и справа сверху publicId как ссылка на детальную страницу; ниже — превью, затем общий ряд чипов
// (грамматические типы → темы → механики → Mixed → курсы), в футере количество позиций жирным.
// Кнопка «Редактировать» ведёт на страницу редактирования (роут /tasks-bank/edit/$publicId, общий виджет TaskForm в edit-режиме).
export function TaskCard({
    task,
    selectable,
    selected,
    canManage,
    deleting,
    onToggleSelect,
    onDelete,
    registerDeleteBtn,
    courseMap,
}: TaskCardProps) {
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


            {/* Левая колонка: название, превью, чипы, футер */}
            <div className={styles.colLeft}>
                <span className={styles.title}>{task.name?.trim() || 'Без названия'}</span>

                {task.previewText && (
                    <ol className={styles.previewList}>
                        {task.previewText.split('\n').map((line, i) => (
                            // Индекс стабильный (строки превью не меняются на месте) — ключ по номеру строки.
                            <li key={`pv-${i}`} className={styles.previewLine}>
                                <span>{line.replace(/^\d+\.\s*/, '')}</span>
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
                    courseNames={(task.courseIds ?? [])
                        .slice(0, 3)
                        .map((id) => courseMap.get(id))
                        .filter(Boolean) as string[]}
                />

                <div className={styles.footer}>
                    <span className={styles.count}>
                        Позиций: <strong>{task.itemCount}</strong>
                    </span>
                </div>
            </div>

            {/* Правая колонка: publicId + badge + кнопки */}
            <div className={styles.colRight}>
                <Link to="/tasks-bank/$publicId" params={{ publicId: task.publicId }} className={`${styles.publicId} ${styles.publicIdLink}`}>
                    {task.publicId}
                </Link>
                <TaskStudentsBadge taskId={task.id} />
                {canManage && (
                    <div className={styles.rightActions}>
                        <Link
                            to="/tasks-bank/edit/$publicId"
                            params={{ publicId: task.publicId }}
                            className={styles.actionBtn}
                        >
                            Редактировать
                        </Link>
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
    );
}
