import { useCallback, useState } from 'react';
import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import { DateTimePicker } from '@/shared/ui-kit/DateTimePicker/DateTimePicker';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { studentDisplayName } from '@/shared/utils/studentDisplayName';
import { useAssignTaskToStudents } from '@/teacher/hooks/useAssignTaskToStudents';
import type { AssignTaskTarget } from './TaskAssignPopup.types';
import styles from './TaskAssignPopup.module.scss';

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

    const toggleStudent = useCallback((id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    }, []);

    const handleAssign = async () => {
        const message = await assign(tasks.map((t) => t.id), selectedIds, deadline || null);
        if (!message) {
            // Успех — закрываем попап и сбрасываем форму для следующего открытия.
            setSelectedIds([]);
            setDeadline('');
            onClose();
        }
    };

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
                        <DateTimePicker value={deadline} onChange={setDeadline} />
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
