import { useCallback, useState } from 'react';
import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import { studentDisplayName } from '@/shared/utils/studentDisplayName';
import { useAssignTaskToStudents } from '@/teacher/hooks/useAssignTaskToStudents';
import styles from './TaskAssignPopup.module.scss';

interface TaskAssignPopupProps {
    open: boolean;
    onClose: () => void;
    /** id просматриваемого задания — отправляем одним элементом taskIds. */
    taskId: number;
}

// Попап «Назначить ученику»: выбор одного/нескольких своих учеников + время, до которого
// задание актуально (deadline, необязательный). Отправка POST /api/teacher/assignments.
export function TaskAssignPopup({ open, onClose, taskId }: TaskAssignPopupProps) {
    const { students, isLoadingStudents, isAssigning, error, lastResult, assign } = useAssignTaskToStudents(open);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deadline, setDeadline] = useState('');

    const toggleStudent = useCallback((id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    }, []);

    const handleAssign = async () => {
        const message = await assign([taskId], selectedIds, deadline || null);
        if (!message) {
            // Успех — закрываем попап и сбрасываем форму для следующего открытия.
            setSelectedIds([]);
            setDeadline('');
            onClose();
        }
    };

    return (
        <BaseModal open={open} onClose={onClose} title="Назначить ученику">
            <div className={styles.modal}>
                <div className={styles.title}>Назначить ученику</div>
                <p className={styles.hint}>Выберите учеников и время, до которого задание актуально.</p>

                {error && <div className={styles.notice}>{error}</div>}
                {lastResult && !error && (
                    <div className={styles.success}>
                        Назначено: {lastResult.createdCount}, пропущено дублей: {lastResult.skippedDuplicateCount}.
                    </div>
                )}

                {isLoadingStudents && <div className={styles.empty}>Загрузка…</div>}
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

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Актуально до (необязательно)</span>
                    <input
                        type="datetime-local"
                        className={styles.deadlineInput}
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </label>

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
            </div>
        </BaseModal>
    );
}
