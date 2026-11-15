import { useNavigate } from '@tanstack/react-router';
import type { DashboardAssignment } from '@/student/types/models/dashboard';
import { StudentStatusBadge } from '@/student/ui/components/StatusBadge/StudentStatusBadge';
import styles from './StudentAssignmentItem.module.scss';
import { formatDeadline } from '@/student/utils';

interface StudentAssignmentItemProps {
    assignment: DashboardAssignment;
}

export function StudentAssignmentItem({ assignment }: StudentAssignmentItemProps) {
    const navigate = useNavigate();
    const statusType = assignment.status === 'EXPIRED' ? 'overdue' : assignment.status === 'IN_PROGRESS' ? 'in-progress' : assignment.status === 'COMPLETED' ? 'completed' : 'new';
    const deadlineFormatted = formatDeadline(assignment.deadline);

    const handleClick = () => {
        if (assignment.status === 'ASSIGNED' || assignment.status === 'IN_PROGRESS') {
            navigate({ to: '/student/work/$workId', params: { workId: String(assignment.id) } });
        } else if (assignment.status === 'COMPLETED') {
            navigate({ to: '/student/work/$workId/results', params: { workId: String(assignment.id) } });
        }
    };

    const interactive = assignment.status === 'ASSIGNED' || assignment.status === 'IN_PROGRESS' || assignment.status === 'COMPLETED';

    return (
        <div
            className={`${styles.hwItem} ${assignment.status === 'EXPIRED' ? styles.overdue : ''} ${interactive ? styles.clickable : ''} ${assignment.status === 'COMPLETED' ? styles.completed : ''}`}
            onClick={interactive ? handleClick : undefined}
        >
            <div className={styles.hwHeader}>
                <div className={styles.hwTitle}>{assignment.taskName ?? assignment.taskPublicId}</div>
                <StudentStatusBadge type={statusType} />
            </div>
            <div className={styles.hwMeta}>
                <div className={styles.chips}>
                    {assignment.itemTypes && assignment.itemTypes.length > 0 && (
                        <span className={styles.chip}>{assignment.itemTypes[0]}</span>
                    )}
                    {assignment.isMixed && <span className={styles.chip}>Mixed</span>}
                    {assignment.levels && assignment.levels.length > 0 && (
                        <span className={styles.chip}>{assignment.levels.join(', ')}</span>
                    )}
                    {assignment.taskTypes && assignment.taskTypes.length > 0 && (
                        <span className={styles.chip}>{assignment.taskTypes[0].name}</span>
                    )}
                    {assignment.topics && assignment.topics.length > 0 && (
                        <span className={styles.chip}>{assignment.topics[0].name}</span>
                    )}
                </div>
                <div className={`${styles.hwDeadline} ${assignment.status === 'EXPIRED' ? styles.urgent : ''}`}>
                    {deadlineFormatted}
                </div>
            </div>
        </div>
    );
}
