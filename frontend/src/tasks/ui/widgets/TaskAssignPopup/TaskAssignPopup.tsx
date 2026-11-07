import { useCallback, useMemo, useState } from 'react';
import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import { DatePicker } from '@/shared/ui-kit/DatePicker/DatePicker';
import { TimePicker } from '@/shared/ui-kit/TimePicker/TimePicker';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { studentDisplayName } from '@/shared/utils/studentDisplayName';
import { useAssignTaskToStudents } from '@/teacher/hooks/useAssignTaskToStudents';
import type { AssignTaskTarget } from './TaskAssignPopup.types';
import styles from './TaskAssignPopup.module.scss';

/** Разбирает строку datetime-local на дату и время. */
function splitDeadline(value: string): { date: string; time: string } {
    if (!value) return { date: '', time: '' };
    const parts = value.split('T');
    return { date: parts[0] ?? '', time: parts[1] ?? '00:00' };
}

/** Объединяет дату и время в строку datetime-local. */
function mergeDeadline(date: string, time: string): string {
    if (!date) return '';
    return `${date}T${time || '00:00'}`;
}

interface TaskAssignPopupProps {
    open: boolean;
    onClose: () => void;
    /** Задания для назначения: одно (страница просмотра) или несколько (bulk-выбор в банке). */
    tasks: AssignTaskTarget[];
}

// Попап «Назначить ученику»: выбор одного/нескольких своих учеников + время, до которого
// задание актуально (deadline, необязательный). Отправка POST /api/teacher/assignments.
// Общий для страницы просмотра (один taskId) и bulk-панели банка заданий (много taskIds) —
// поведение кнопки «Назначить» идентично: отправка, блокировка на время запроса,
// сброс формы и закрытие при успехе.
export function TaskAssignPopup({ open, onClose, tasks }: TaskAssignPopupProps) {
    const { students, isLoadingStudents, isAssigning, error, lastResult, assign } = useAssignTaskToStudents(open);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deadline, setDeadline] = useState('');

    // Разделяем deadline на дату и время для DatePicker и TimePicker
    const { date: deadlineDate, time: deadlineTime } = useMemo(
        () => splitDeadline(deadline),
        [deadline],
    );

    const toggleStudent = useCallback((id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    }, []);

    const handleAssign = async () => {
        const merged = mergeDeadline(deadlineDate, deadlineTime);
        const message = await assign(tasks.map((t) => t.id), selectedIds, merged || null);
        if (!message) {
            // Успех — закрываем попап и сбрасываем форму для следующего открытия.
            setSelectedIds([]);
            setDeadline('');
            onClose();
        }
    };

    const handleDateChange = useCallback(
        (date: string) => setDeadline(mergeDeadline(date, deadlineTime)),
        [deadlineTime],
    );

    const handleTimeChange = useCallback(
        (time: string) => setDeadline(mergeDeadline(deadlineDate, time)),
        [deadlineDate],
    );

    // Подсказка в шапке: одно задание — его название; несколько — счётчик bulk-выбора.
    const tasksHint =
        tasks.length === 1
            ? `Задание: ${tasks[0].name?.trim() || 'Без названия'}`
            : `Выбрано заданий: ${tasks.length}`;

    return (
        <BaseModal
            open={open}
            onClose={onClose}
            title="Назначить ученику"
            content={
                <>
                    <p className={styles.hint}>
                        {tasksHint}. Выберите учеников и время, до которого задание актуально.
                    </p>

                    {error && <div className={styles.notice}>{error}</div>}
                    {lastResult && !error && (
                        <div className={styles.success}>
                            Назначено: {lastResult.createdCount}, пропущено дублей: {lastResult.skippedDuplicateCount}.
                        </div>
                    )}

                    {isLoadingStudents && <Loader />}
                    {!isLoadingStudents && !students.length && (
                        <div className={styles.empty}>У вас пока нет учеников.</div>
                    )}

                    {!isLoadingStudents && (
                        <ul className={styles.list}>
                            {students.map((student) => (
                                <li key={student.id} className={styles.item}>
                                    <label className={styles.studentLabel}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(student.id)}
                                            onChange={() => toggleStudent(student.id)}
                                        />
                                        <span>{studentDisplayName(student)}</span>
                                    </label>
                                    <span className={styles.email}>{student.email}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>Актуально до (необязательно)</span>
                        <div className={styles.datetimeRow}>
                            <DatePicker value={deadline} onChange={handleDateChange} />
                            <TimePicker value={deadlineTime} onChange={handleTimeChange} />
                        </div>
                    </div>
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
                        disabled={isAssigning || !selectedIds.length}
                        onClick={() => void handleAssign()}
                    >
                        {isAssigning ? 'Назначение…' : 'Назначить'}
                    </button>
                </div>
            }
        />
    );
}
