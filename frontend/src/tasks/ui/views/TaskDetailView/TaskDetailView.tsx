import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { useTaskDetail } from '@/tasks/hooks/useTaskDetail';
import { TaskCoursePopup } from '@/tasks/ui/widgets/TaskCoursePopup/TaskCoursePopup';
import { TaskAssignPopup } from '@/tasks/ui/widgets/TaskAssignPopup/TaskAssignPopup';
import { MECHANIC_CHIP_LABELS } from '@/tasks/types';
import type { ItemType, TaskItemResponseDto } from '@/tasks/types';
import {
    parseGapFillContent,
    parseMatchingContent,
    parseTaskContext,
    parseWordFormationContent,
    parseExplanation,
} from '@/tasks/lib/parseTaskContent';
import styles from './TaskDetailView.module.scss';

interface TaskDetailViewProps {
    publicId: string;
}

// Экран «Просмотр задания»: максимум подробностей — название, описание (инструкция),
// материал, все пункты с правильными ответами. Правильные ответы и блок «Ответы» видны
// только учителю (бэк отдаёт correctAnswer в GET /tasks/by-public-id, ученик их не видит).
// Быстрые действия учителя: курсы (добавить/убрать через попап выбора курса) и назначение ученику.
export function TaskDetailView({ publicId }: TaskDetailViewProps) {
    const isTeacher = AuthService.getUserRole() === 'TEACHER';
    const { task, isLoading, isError, error } = useTaskDetail(publicId);
    const [coursePopupOpen, setCoursePopupOpen] = useState(false);
    const [assignPopupOpen, setAssignPopupOpen] = useState(false);
    // Блок «Ответы» (правильные ответы задания) — раскрывающийся/скрывающийся по клику на заголовок.
    const [answersOpen, setAnswersOpen] = useState(false);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <BackLink />
                <div className={styles.notice}>Загрузка…</div>
            </div>
        );
    }

    if (isError || !task) {
        return (
            <div className={styles.page}>
                <BackLink />
                <div className={styles.notice}>{error ?? 'Задание не найдено.'}</div>
            </div>
        );
    }

    const context = parseTaskContext(task.context);
    const itemTypes = [...new Set(task.items.map((item) => item.itemType))] as ItemType[];

    return (
        <div className={styles.page}>
            <BackLink />

            <div className={styles.header}>
                <h1>{task.name?.trim() || 'Без названия'}</h1>
                <p className={styles.publicIdText}>{task.publicId}</p>
            </div>

            {/* Быстрые действия учителя (курсы/назначение работают только с id из полной карточки). */}
            {isTeacher && (
                <div className={styles.actions}>
                    <button type="button" className={styles.actionBtn} onClick={() => setCoursePopupOpen(true)}>
                        Добавить/Удалить из курса
                    </button>
                    <button type="button" className={styles.actionBtn} onClick={() => setAssignPopupOpen(true)}>
                        Назначить ученику
                    </button>
                </div>
            )}

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
                {itemTypes.map((mechanic) => (
                    <span key={`mt-${mechanic}`} className={styles.tag}>
                        {MECHANIC_CHIP_LABELS[mechanic]}
                    </span>
                ))}
                {task.isMixed && <span className={`${styles.tag} ${styles.mixedTag}`}>Mixed</span>}
            </div>

            {task.instruction && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Описание</h2>
                    <p className={styles.instruction}>{task.instruction}</p>
                </section>
            )}

            {context && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Материал</h2>
                    {context.title && <p className={styles.materialTitle}>{context.title}</p>}
                    <p className={styles.materialText}>{context.text}</p>
                </section>
            )}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Пункты ({task.items.length})</h2>
                <ol className={styles.items}>
                    {task.items.map((item) => (
                        <TaskDetailItem key={item.id} item={item} showAnswers={isTeacher} />
                    ))}
                </ol>
            </section>

            {/* Только учитель: правильные ответы задания (ученик их не видит) — раскрывающийся блок. */}
            {isTeacher && (
                <section className={styles.section}>
                    <button
                        type="button"
                        className={styles.answersToggle}
                        aria-expanded={answersOpen}
                        onClick={() => setAnswersOpen((prev) => !prev)}
                    >
                        <span className={styles.answersToggleTitle}>
                            Ответы {!answersOpen && <span className={styles.answersHint}>({task.items.length})</span>}
                        </span>
                        <span className={styles.chevron}>{answersOpen ? '▲' : '▼'}</span>
                    </button>
                    {answersOpen && (
                        <ul className={styles.answersList}>
                            {task.items.map((item, index) => (
                                <li key={`ans-${item.id}`} className={styles.answerRow}>
                                    <strong>{index + 1}.</strong>
                                    <span>{formatCorrectAnswer(item)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            {isTeacher && coursePopupOpen && (
                <TaskCoursePopup open onClose={() => setCoursePopupOpen(false)} taskId={task.id} />
            )}
            {isTeacher && assignPopupOpen && (
                <TaskAssignPopup open onClose={() => setAssignPopupOpen(false)} taskId={task.id} />
            )}
        </div>
    );
}

function BackLink() {
    return (
        <Link to="/tasks-bank" className={styles.backLink}>
            ← К банку заданий
        </Link>
    );
}

// Один пункт задания: prompt/механика-специфичные поля (база, опции, пара) + пояснение.
// Правильный ответ показываем только учителю (showAnswers).
function TaskDetailItem({ item, showAnswers }: { item: TaskItemResponseDto; showAnswers: boolean }) {
    const word = parseWordFormationContent(item.content);
    const gap = parseGapFillContent(item.content);
    const pair = parseMatchingContent(item.content);
    const explanation = parseExplanation(item.content);

    return (
        <li className={styles.item}>
            <div className={styles.itemHeader}>
                Пункт {item.position + 1} · {MECHANIC_CHIP_LABELS[item.itemType]}
            </div>

            {item.prompt && <p className={styles.itemPrompt}>{item.prompt}</p>}

            {item.itemType === 'WORD_FORMATION' && word?.base && (
                <p className={styles.itemMeta}>
                    База: <strong>{word.base}</strong>
                </p>
            )}
            {item.itemType === 'GAP_FILL' && gap?.options?.length ? (
                <p className={styles.itemMeta}>Опции: {gap.options.join(', ')}</p>
            ) : null}
            {item.itemType === 'MATCHING' && pair?.left_label && (
                <p className={styles.itemMeta}>
                    {pair.left_label} → {pair.right_label ?? ''}
                </p>
            )}

            {showAnswers && (
                <p className={styles.itemAnswer}>
                    Ответ: <strong>{formatCorrectAnswer(item)}</strong>
                </p>
            )}
            {explanation && <p className={styles.itemExplanation}>Пояснение: {explanation}</p>}
        </li>
    );
}

// Человекочитаемый правильный ответ пункта: у MATCHING эталона нет — собираем пару из content.
function formatCorrectAnswer(item: TaskItemResponseDto): string {
    if (item.correctAnswer) return item.correctAnswer;
    if (item.itemType === 'MATCHING') {
        const pair = parseMatchingContent(item.content);
        if (pair?.left_label) return `${pair.left_label} → ${pair.right_label ?? ''}`;
    }
    return '—';
}
