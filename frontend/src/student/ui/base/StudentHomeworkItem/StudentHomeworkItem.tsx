import { StudentStatusBadge } from '@/student/ui/base/StudentStatusBadge/StudentStatusBadge.tsx';
import { StudentHomeworkProgressBar } from '@/student/ui/base/StudentHomeworkProgressBar/StudentHomeworkProgressBar.tsx';
import { formatDeadline } from '@/student/utils';
import type { StudentWorkResponse } from '@/student/services/StudentDashboardService.ts';
import styles from './StudentHomeworkItem.module.scss';
import type {UITaskStatus} from "@/task/types";

/** Маппинг статуса на отображаемый текст */
const STATUS_LABELS: Record<string, string> = {
    ASSIGNED: 'Новое',
    IN_PROGRESS: 'В процессе',
    COMPLETED: 'Выполнено',
    CANCELLED: 'Отменено',
    EXPIRED: 'Просрочено',
};

export interface StudentHomeworkItemProps {
    work: StudentWorkResponse;
    onClick: () => void;
}

export function StudentHomeworkItem({ work, onClick }: StudentHomeworkItemProps) {
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

            <StudentHomeworkProgressBar completed={completedItems} total={totalItems} />
        </div>
    );
}
