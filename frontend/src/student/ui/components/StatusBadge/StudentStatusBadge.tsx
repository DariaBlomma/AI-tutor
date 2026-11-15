import type { ReactNode } from 'react';
import styles from './StudentStatusBadge.module.scss';

export type StatusType = 'new' | 'in-progress' | 'overdue' | 'completed';

interface StudentStatusBadgeProps {
    type: StatusType;
    children?: ReactNode;
}

const LABELS: Record<StatusType, string> = {
    'new': 'Новое',
    'in-progress': 'В процессе',
    'overdue': 'Просрочено',
    'completed': 'Выполнено',
};

export function StudentStatusBadge({ type, children }: StudentStatusBadgeProps) {
    return <span className={`${styles.badge} ${styles[type]}`}>{children ?? LABELS[type]}</span>;
}
