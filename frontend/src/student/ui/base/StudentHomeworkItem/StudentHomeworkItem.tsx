import { StudentStatusBadge } from '@/student/ui/base/StudentStatusBadge/StudentStatusBadge.tsx';
import { StudentHomeworkProgressBar } from '@/student/ui/base/StudentHomeworkProgressBar/StudentHomeworkProgressBar.tsx';
import { formatDeadline } from '@/student/utils';
import type { StudentHomeworkItemProps } from '@/student/types/ui';
import { UITaskStatus } from '@/task/types/ui';
import styles from './StudentHomeworkItem.module.scss';

/** Маппинг статуса на отображаемый текст */
const STATUS_LABELS: Record<string, string> = {
    ASSIGNED: 'Новое',
    IN_PROGRESS: 'В процессе',
    COMPLETED: 'Выполнено',
    CANCELLED: 'Отменено',
    EXPIRED: 'Просрочено',
};

export function StudentHomeworkItem({ work, onClick }: StudentHomeworkItemProps) {
    const completedItems = work.completedItems ?? 0;
    const totalItems = work.totalItems ?? 0;

    return (
        <div className={styles.item} onClick={onClick}>
            <div className={styles.header}>
                <div className={styles.title}>{work.taskName}</div>
                <StudentStatusBadge type={UITaskStatus.NEW}>
                    {STATUS_LABELS[work.status] || work.status}
                </StudentStatusBadge>
            </div>

            <div className={styles.meta}>
                <div className={styles.teacher}>—</div>
                <div className={`${styles.deadline} ${work.status === 'EXPIRED' ? styles.urgent : ''}`}>
                    {work.deadline ? formatDeadline(work.deadline) : ''}
                </div>
            </div>

            <StudentHomeworkProgressBar completed={completedItems} total={totalItems} />
        </div>
    );
}
