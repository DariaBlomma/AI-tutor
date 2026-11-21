import { useNavigate } from '@tanstack/react-router';
import type { StudentWorkCard } from '@/student/types/models/studentWorkCard';
import { StudentStatusBadge } from '@/student/ui/components/StatusBadge/StudentStatusBadge';
import { TaskAssignmentDate } from '@/tasks/ui/base/TaskAssignmentDate';
import { getBadgeType } from '@/student/lib/assignmentStatus';
import styles from './TaskAssignmentItem.module.scss';
import { formatDeadline, formatCompletedAt, formatAssignedAt } from '@/student/utils';

interface TaskAssignmentItemProps {
    card: StudentWorkCard;
    /** Если задан — рендерит прогресс-бар под мета-информацией. */
    showProgress?: React.ReactNode;
}

export function TaskAssignmentItem({ card, showProgress }: TaskAssignmentItemProps) {
    const navigate = useNavigate();
    const statusType = getBadgeType(card);
    const deadlineFormatted = formatDeadline(card.deadline);
    const completedAtFormatted = formatCompletedAt(card.completedAt ?? undefined);
    const assignedAtFormatted = formatAssignedAt(card.createdAt);

    const handleClick = () => {
        if (card.status === 'ASSIGNED' || card.status === 'IN_PROGRESS') {
            navigate({ to: '/student/work/$workId', params: { workId: String(card.id) } });
        } else if (card.status === 'COMPLETED') {
            navigate({ to: '/student/work/$workId/report', params: { workId: String(card.id) } });
        }
    };

    const interactive = card.status === 'ASSIGNED' || card.status === 'IN_PROGRESS' || card.status === 'COMPLETED';

    return (
        <div
            className={`${styles.hwItem} ${card.status === 'EXPIRED' ? styles.overdue : ''} ${interactive ? styles.clickable : ''} ${card.status === 'COMPLETED' ? styles.completed : ''}`}
            onClick={interactive ? handleClick : undefined}
        >
            <div className={styles.hwHeader}>
                <div className={styles.hwTitle}>{card.taskName ?? card.taskPublicId}</div>
                <StudentStatusBadge type={statusType} />
            </div>
            <div className={styles.hwMeta}>
                <div className={styles.chips}>
                    {card.itemTypes && card.itemTypes.length > 0 && (
                        <span className={styles.chip}>{card.itemTypes[0]}</span>
                    )}
                    {card.isMixed && <span className={styles.chip}>Mixed</span>}
                    {card.levels && card.levels.length > 0 && (
                        <span className={styles.chip}>{card.levels.join(', ')}</span>
                    )}
                    {card.taskTypes && card.taskTypes.length > 0 && (
                        <span className={styles.chip}>{card.taskTypes[0].name}</span>
                    )}
                    {card.topics && card.topics.length > 0 && (
                        <span className={styles.chip}>{card.topics[0].name}</span>
                    )}
                </div>
                <TaskAssignmentDate
                    deadline={deadlineFormatted}
                    statusType={statusType}
                    completedAt={completedAtFormatted}
                    assignedAt={assignedAtFormatted}
                    workStatus={card.status}
                />
            </div>
            {showProgress && (
                <div className={styles.progress}>{showProgress}</div>
            )}
        </div>
    );
}
