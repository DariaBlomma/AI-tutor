import { StudentStatusBadge } from '@/student/ui/components/StatusBadge/StudentStatusBadge';
import { HomeworkProgressBar } from '@/student/ui/components/HomeworkProgressBar/HomeworkProgressBar';
import { formatDeadline } from '@/student/utils';
import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';
import styles from './HomeworkItem.module.scss';

export interface HomeworkItemProps {
    work: StudentWorkResponse;
    onClick: () => void;
}

/** Маппинг статуса на отображаемый текст */
const STATUS_LABELS: Record<string, string> = {
    ASSIGNED: 'Новое',
    IN_PROGRESS: 'В процессе',
    COMPLETED: 'Выполнено',
    CANCELLED: 'Отменено',
    EXPIRED: 'Просрочено',
};

export function HomeworkItem({ work, onClick }: HomeworkItemProps) {
    const completedItems = work.completedItems ?? 0;
    const totalItems = work.totalItems ?? 0;

    return (
        <div className={styles.item} onClick={onClick}>
            <div className={styles.header}>
                <div className={styles.title}>{work.taskName}</div>
                <StudentStatusBadge type="new">
                    {STATUS_LABELS[work.status] || work.status}
                </StudentStatusBadge>
            </div>

            <div className={styles.meta}>
                <div className={styles.teacher}>—</div>
                <div className={`${styles.deadline} ${work.status === 'EXPIRED' ? styles.urgent : ''}`}>
                    {work.deadline ? formatDeadline(work.deadline) : ''}
                </div>
            </div>

            <HomeworkProgressBar completed={completedItems} total={totalItems} />
        </div>
    );
}
