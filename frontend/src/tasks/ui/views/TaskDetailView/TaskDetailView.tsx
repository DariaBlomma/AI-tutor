import { useMemo, useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTeacherCourses } from '@/teacher/hooks/useTeacherCourses';
import { CourseSelectMulti } from '@/tasks/ui/widgets/CourseSelectMulti/CourseSelectMulti';
import { useTaskDetail } from '@/tasks/hooks/useTaskDetail';
import { useTaskDetailCourses } from '@/tasks/hooks/useTaskDetailCourses';
import { useIsTeacher } from '@/tasks/hooks/useIsTeacher';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { TaskPreviewChips } from '@/tasks/ui/widgets/TaskPreviewChips/TaskPreviewChips';
import { TaskAssignPopup } from '@/tasks/ui/widgets/TaskAssignPopup/TaskAssignPopup';
import { BackLink } from '@/tasks/ui/widgets/BackLink/BackLink';
import { TaskDetailItem } from '@/tasks/ui/widgets/TaskDetailItem/TaskDetailItem';
import { parseTaskContext } from '@/tasks/lib/parseTaskContent';
import styles from './TaskDetailView.module.scss';

interface TaskDetailViewProps {
    publicId: string;
}

// Экран «Просмотр задания»: максимум подробностей — название, описание (инструкция),
// материал, все пункты; правильный ответ — под каждым пунктом (только учителю).
// Чипы (типы/темы/механики/Mixed) показываются один раз вверху — переиспользуется
// компонент TaskPreviewChips со списком банка; механику в каждом пункте не дублируем.
// Быстрые действия учителя: inline-мультиселект курсов и назначение ученику.
export function TaskDetailView({ publicId }: TaskDetailViewProps) {
    const isTeacher = useIsTeacher();
    const { task, isLoading, isError, error, reload } = useTaskDetail(publicId);

    // Перезагрузка при каждом входе на экран: после сохранения на странице редактирования
    // просмотр обязан показать свежие данные (useTaskDetail кэша не имеет — staleTime: 0).
    useEffect(() => {
        reload();
    }, [reload]);

    // Inline-мультиселект курсов: все курсы учителя + предвыбранные из task.courseIds.
    const [assignPopupOpen, setAssignPopupOpen] = useState(false);

    const { courses: teacherCourses, isLoading: coursesLoading, createCourse } = useTeacherCourses(true);

    const { selectedCourseIds, actionError, handleCourseChange } = useTaskDetailCourses(task?.id, task?.courseIds);

    const courseNames = useMemo(
        () => (task?.courseIds ?? [])
            .slice(0, 3)
            .map((id) => teacherCourses.find((c) => c.id === id)?.name)
            .filter(Boolean) as string[],
        [task?.courseIds, teacherCourses],
    );

    const courseOptions = useMemo(
        () => teacherCourses.map((c) => ({ value: String(c.id), label: c.name })),
        [teacherCourses],
    );

    if (isLoading) {
        return (
            <div className={styles.page}>
                <BackLink />
                <Loader />
            </div>
        );
    }

    // Ошибка запроса и «задание не найдено» — разные состояния: у ошибки показываем её текст,
    // иначе пустой результат трактуем как «не найдено» (без красного стиля).
    if (isError || !task) {
        return (
            <div className={styles.page}>
                <BackLink />
                <div className={isError ? styles.error : styles.notice}>{error ?? 'Задание не найдено.'}</div>
            </div>
        );
    }

    const context = parseTaskContext(task.context);
    // Механики пунктов — уникальные ItemType задания; чипы с ними показываются один раз вверху.
    const itemTypes = [...new Set(task.items.map((item) => item.itemType))];

    return (
        <div className={styles.page}>
            <BackLink />

            <div className={styles.header}>
                <h1>{task.name?.trim() || 'Без названия'}</h1>
                <p className={styles.publicIdText}>{task.publicId}</p>
            </div>

            {/* Быстрые действия учителя (назначение/редактирование). */}
            {isTeacher && (
                <div className={styles.actions}>
                    <button type="button" className={styles.actionBtn} onClick={() => setAssignPopupOpen(true)}>
                        Назначить ученику
                    </button>
                    {/* Переход на страницу редактирования (роут /tasks-bank/edit/$publicId). */}
                    <Link to="/tasks-bank/edit/$publicId" params={{ publicId: task.publicId }} className={styles.actionBtn}>
                        Редактировать
                    </Link>
                    <section className={styles.courseSelect}>
                        <h2 className={styles.sectionTitle}>Курсы</h2>
                        {actionError && <div className={styles.error}>{actionError}</div>}
                        <CourseSelectMulti
                            options={courseOptions}
                            value={selectedCourseIds}
                            onChange={handleCourseChange}
                            placeholder={'Выберите курсы'}
                            isDisabled={coursesLoading}
                            ariaLabel="Курсы для задания"
                            onCreateCourse={createCourse}
                        />
                    </section>
                </div>
            )}

            <TaskPreviewChips levels={task.levels} examType={task.examType} grammarTypes={task.taskTypes} topics={task.topics} itemTypes={itemTypes} isMixed={task.isMixed} courseNames={courseNames} />

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

            {/* Только учитель: правильные ответы задания (ученик их не видит) — под каждым пунктом. */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Пункты ({task.items.length})</h2>
                <ol className={styles.items}>
                    {task.items.map((item) => (
                        <TaskDetailItem key={item.id} item={item} showAnswers={isTeacher} />
                    ))}
                </ol>
            </section>

            {isTeacher && assignPopupOpen && (
                <TaskAssignPopup open onClose={() => setAssignPopupOpen(false)} tasks={[{ id: task.id, name: task.name }]} />
            )}
        </div>
    );
}
