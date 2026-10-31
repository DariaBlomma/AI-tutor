import { useCallback, useMemo, useState } from 'react';
import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { BaseSelectMulti } from '@/shared/ui-kit/BaseSelectMulti/BaseSelectMulti';
import { LoadingWidget } from '@/shared/ui-kit/Loader/LoadingWidget';
import { useTeacherCourses } from '@/teacher/hooks/useTeacherCourses';
import type { CourseTaskAddRequestDto } from '@/teacher/types';
import { CoursesService } from '@/teacher/services/CoursesService';
import styles from './CourseSelectPopup.module.scss';

interface CourseSelectPopupProps {
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
// Добавление — POST /api/courses/{courseId}/tasks для каждой пары (курс × задание);
// повторное добавление бэк молча игнорирует, поэтому «пропущено» = уже было в курсе.
export function CourseSelectPopup({ open, onClose, taskIds, tasksHint, onAdded }: CourseSelectPopupProps) {
    // Список курсов грузится лениво — только при открытом попапе; createCourse обновляет его локально.
    const { courses, isLoading, error, createCourse } = useTeacherCourses(open);

    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [newCourseName, setNewCourseName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
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

    // Создание курса: POST /api/courses (только name) → новый курс появляется в списке.
    // Хук возвращает текст ошибки или null; id созданного курса хук не отдаёт, поэтому
    // после успеха перезапрашивать список не нужно — курс уже вставлен в начало.
    const handleCreateCourse = useCallback(async () => {
        const name = newCourseName.trim();
        if (!name || isCreating) return;
        setIsCreating(true);
        setActionError(null);
        const message = await createCourse(name);
        setIsCreating(false);
        if (message) {
            setActionError(message);
            return;
        }
        setNewCourseName('');
    }, [newCourseName, isCreating, createCourse]);

    // Отправка: для каждого выбранного курса — по заданию на каждый taskIds.
    const handleAdd = useCallback(async () => {
        const courseIdNums = selectedCourseIds.map(Number);
        if (!courseIdNums.length || isAdding) return;
        setIsAdding(true);
        setActionError(null);
        setAddResult(null);
        let added = 0;
        try {
            for (const courseId of courseIdNums) {
                for (const taskId of taskIds) {
                    const payload: CourseTaskAddRequestDto = { taskId, position: null };
                    await CoursesService.addTaskToCourse(courseId, payload);
                    added += 1;
                }
            }
            setAddResult(added);
            setSelectedCourseIds([]);
            onAdded?.(taskIds, courseIdNums);
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Не удалось добавить задания в курс.');
        } finally {
            setIsAdding(false);
        }
    }, [selectedCourseIds, isAdding, taskIds, onAdded]);

    return (
        <BaseModal open={open} onClose={onClose} title="Добавить в курс">
            <div className={styles.modal}>
                <div className={styles.title}>Добавить в курс</div>
                <p className={styles.hint}>{tasksHint}. Выберите курсы, в которые нужно добавить задание.</p>

                {(error || actionError) && <div className={styles.error}>{actionError ?? error}</div>}
                {addResult !== null && (
                    <div className={styles.success}>
                        Добавлено в курсы: {addResult}.
                    </div>
                )}

                <LoadingWidget active={isLoading} mode="block">
                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Курсы</span>
                        <BaseSelectMulti
                            options={options}
                            value={selectedCourseIds}
                            onChange={changeCourses}
                            placeholder={courses.length ? 'Выберите курсы' : 'Сначала создайте курс'}
                            ariaLabel="Курсы для добавления задания"
                        />
                        {!courses.length && !isLoading && (
                            <div className={styles.empty}>Курсов пока нет — создайте первый ниже.</div>
                        )}
                    </div>
                </LoadingWidget>

                {/* Создание курса: нужен только текстовый инпут названия. */}
                <div className={styles.createRow}>
                    <BaseInputText
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="Название нового курса"
                        aria-label="Название нового курса"
                        maxLength={120}
                    />
                    <button
                        type="button"
                        className={styles.createBtn}
                        disabled={!newCourseName.trim() || isCreating}
                        onClick={() => void handleCreateCourse()}
                    >
                        {isCreating ? 'Создание…' : 'Создать курс'}
                    </button>
                </div>

                <div className={styles.buttons}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>
                        Отмена
                    </button>
                    <button
                        type="button"
                        className={styles.submitBtn}
                        disabled={isAdding || !selectedCourseIds.length}
                        onClick={() => void handleAdd()}
                    >
                        {isAdding ? 'Добавление…' : 'Добавить'}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
}
