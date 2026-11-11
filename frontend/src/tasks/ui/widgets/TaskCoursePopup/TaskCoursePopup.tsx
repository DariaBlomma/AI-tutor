import { useCallback, useMemo, useState } from 'react';
import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import { CourseSelectMulti } from '@/tasks/ui/widgets/CourseSelectMulti/CourseSelectMulti';
import { LoadingWidget } from '@/shared/ui-kit/Loader/LoadingWidget';
import { useTeacherCourses } from '@/teacher/hooks/useTeacherCourses';
import { CoursesService } from '@/teacher/services/CoursesService';
import styles from './TaskCoursePopup.module.scss';

interface TaskCoursePopupProps {
    open: boolean;
    onClose: () => void;
    /** Задания для добавления в курс: одно (кнопка карточки) или несколько (bulk-панель банка). */
    taskIds: number[];
    /** Подсказка в шапке: название одного задания или счётчик bulk-выбора. */
    tasksHint: string;
    /** Успешное добавление: родитель закрывает попап и снимает выбор/перезагружает список. */
    onAdded?: (addedTaskIds: number[], courseIds: number[]) => void;
}

// Попап «Добавить в курс»: мультиселект курсов (та же библиотека, что сингл-селект —
// react-select через BaseSelectMulti) + создание курса прямо здесь (нужно только название).
// Bulk-добавление — один POST /api/courses/bulk-add вместо N×M отдельных запросов.
// Повторное добавление бэк молча игнорирует, поэтому «пропущено» = уже было в курсе.
export function TaskCoursePopup({ open, onClose, taskIds, onAdded }: TaskCoursePopupProps) {
    // Список курсов грузится лениво — только при открытом попапе; createCourse обновляет его локально.
    const { courses, isLoading, error, createCourse } = useTeacherCourses(open);


    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [actionError, setActionError] = useState<string | null>(null);
    const [addResult, setAddResult] = useState<number | null>(null);

    const options = useMemo(
        () => courses.map((c) => ({ value: String(c.id), label: c.name })),
        [courses],
    );

    const changeCourses = useCallback((values: string[]) => {
        setSelectedCourseIds(values);
        setActionError(null);
        setAddResult(null);
    }, []);

    // Bulk-отправка: один POST /api/courses/bulk-add вместо N×M отдельных запросов.
    const handleAdd = useCallback(async () => {
        const courseIdNums = selectedCourseIds.map(Number);
        if (!courseIdNums.length) return;
        setActionError(null);
        setAddResult(null);
        try {
            await CoursesService.bulkAddTasks({ taskIds, courseIds: courseIdNums });
            // Бэк молча игнорирует дубликаты, поэтому точное количество добавленных неизвестно —
            // считаем все пары как успешно добавленные (фронт не проверяет, что уже было в курсе).
            setAddResult(taskIds.length * courseIdNums.length);
            setSelectedCourseIds([]);
            onAdded?.(taskIds, courseIdNums);
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Не удалось добавить задания в курс.');
        }
    }, [selectedCourseIds, taskIds, onAdded]);

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title="Добавить в курс"
            content={
                <>
                    {(error || actionError) && <div className={styles.error}>{actionError ?? error}</div>}
                    {addResult !== null && (
                        <div className={styles.success}>Добавлено в курсы: {addResult}.</div>
                    )}

                    <LoadingWidget active={isLoading} mode="overlay" dimContent>
                        <div className={styles.field}>
                            <span className={styles.fieldLabel}>Курсы</span>
                            <CourseSelectMulti
                                options={options}
                                value={selectedCourseIds}
                                onChange={changeCourses}
                                placeholder={courses.length ? 'Выберите курсы' : 'Сначала создайте курс'}
                                ariaLabel="Курсы для добавления задания"
                                onCreateCourse={createCourse}
                            />
                        </div>
                    </LoadingWidget>
                </>
            }
            footer={
                <div className={styles.buttons}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>
                        Отмена
                    </button>
                    <button
                        type="button"
                        className={styles.submitBtn}
                        disabled={!selectedCourseIds.length}
                        onClick={() => void handleAdd()}
                    >
                        Добавить
                    </button>
                </div>
            }
        />
    );
}
