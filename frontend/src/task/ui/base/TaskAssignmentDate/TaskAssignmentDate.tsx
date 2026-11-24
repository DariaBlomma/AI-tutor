import type { UITaskStatus } from '@/task/types/ui';
import styles from './TaskAssignmentDate.module.scss';

interface TaskAssignmentDateProps {
    /** Основная дата (дедлайн). */
    deadline: string;
    /** UI-статус задачи. */
    statusType: UITaskStatus;
    /** Дата выполнения (опционально). */
    completedAt?: string;
    /** Дата создания (опционально). */
    assignedAt?: string;
    /** Статус работы. */
    workStatus: string;
}

/**
 * Компонент для отображения дат карточки задания.
 * Унифицирует форматирование и стили для всех типов дат.
 */
export function TaskAssignmentDate({
    deadline,
    statusType,
    completedAt,
    assignedAt,
    workStatus,
}: TaskAssignmentDateProps) {
    return (
        <div className={styles.container}>
            {/* Дедлайн */}
            <div className={styles.deadline}>
                {deadline}
            </div>

            {/* Дата выполнения */}
            {workStatus === 'COMPLETED' && completedAt && (
                <div className={styles.extraDate}>{completedAt}</div>
            )}

            {/* Дата создания (только для NEW статуса, не для urgent/overdue) */}
            {statusType === 'new' && assignedAt && (
                <div className={styles.extraDate}>{assignedAt}</div>
            )}
        </div>
    );
}
