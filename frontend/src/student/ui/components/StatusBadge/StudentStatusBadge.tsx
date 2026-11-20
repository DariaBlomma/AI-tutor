import type { ReactNode } from 'react';
import type { UITaskStatus } from '@/tasks/types/ui';
import { UITASK_STATUS_LABELS } from '@/tasks/types/ui';
import styles from './StudentStatusBadge.module.scss';

interface StudentStatusBadgeProps {
    type: UITaskStatus;
    children?: ReactNode;
}

export function StudentStatusBadge({ type, children }: StudentStatusBadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[type]}`}>
            {children ?? UITASK_STATUS_LABELS[type]}
        </span>
    );
}
