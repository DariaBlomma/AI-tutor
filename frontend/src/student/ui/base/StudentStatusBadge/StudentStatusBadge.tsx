import type { StudentStatusBadgeProps } from '@/student/types/ui';
import { UITASK_STATUS_LABELS } from '@/task/types/ui';
import styles from './StudentStatusBadge.module.scss';

export function StudentStatusBadge({ type, children }: StudentStatusBadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[type]}`}>
            {children ?? UITASK_STATUS_LABELS[type]}
        </span>
    );
}
