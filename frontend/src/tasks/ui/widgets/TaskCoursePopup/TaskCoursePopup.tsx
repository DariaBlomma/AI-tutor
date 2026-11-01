import { useState } from 'react';
import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { useTaskCourses } from '@/teacher/hooks/useTaskCourses';
import styles from './TaskCoursePopup.module.scss';

interface TaskCoursePopupProps {
    open: boolean;
    onClose: () => void;
    /** id задания (из полной карточки TaskResponse). */
    taskId: number;
}

// Попап «Курсы»: выбор курса и быстрое действие для одного курса —
// «Добавить в курс», если задания в нём ещё нет, или «Убрать из курса», если уже есть.
// Список берётся из GET /api/courses?taskId= (CourseService.getAllWithTaskFlag).
export function TaskCoursePopup({ open, onClose, taskId }: TaskCoursePopupProps) {
    const { courses, isLoading, error, toggleTaskInCourse } = useTaskCourses(taskId, open);
    // id курса, для которого сейчас идёт запрос добавления/удаления — блокируем его кнопки.
    const [busyCourseId, setBusyCourseId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const handleToggle = async (courseId: number, inCourse: boolean) => {
        setBusyCourseId(courseId);
        setActionError(null);
        const message = await toggleTaskInCourse(courseId, taskId, inCourse);
        setActionError(message);
        setBusyCourseId(null);
    };

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title="Курсы"
            content={
                <>
                    <p className={styles.hint}>Добавьте задание в курс или уберите из курса.</p>

                    {(error || actionError) && <div className={styles.error}>{actionError ?? error}</div>}

                    {isLoading && <Loader />}
                    {!isLoading && !courses.length && <div className={styles.empty}>Курсов пока нет.</div>}

                    {!isLoading && (
                        <ul className={styles.list}>
                            {courses.map((course) => (
                                <li key={course.id} className={styles.item}>
                                    <span className={styles.itemName}>{course.name}</span>
                                    <button
                                        type="button"
                                        className={`${styles.actionBtn} ${course.hasTask ? styles.dangerBtn : ''}`}
                                        disabled={busyCourseId === course.id}
                                        onClick={() => void handleToggle(course.id, course.hasTask)}
                                    >
                                        {busyCourseId === course.id
                                            ? '…'
                                            : course.hasTask
                                              ? 'Убрать из курса'
                                              : 'Добавить в курс'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            }
            footer={
                <button type="button" className={styles.closeBtn} onClick={onClose}>
                    Закрыть
                </button>
            }
        />
    );
}
