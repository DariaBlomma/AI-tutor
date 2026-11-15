import type { MonthlyStats } from '@/student/types/models/dashboard';
import styles from './StudentStatCards.module.scss';

interface StudentStatCardsProps {
    stats: MonthlyStats;
}

const STAT_ITEMS = [
    { key: 'completedCount' as const, label: 'Выполнено' },
    { key: 'inProgressCount' as const, label: 'В процессе' },
    { key: 'overdueCount' as const, label: 'Просрочено' },
];

export function StudentStatCards({ stats }: StudentStatCardsProps) {
    return (
        <div className={styles.statsGrid}>
            {STAT_ITEMS.map(({ key, label }) => (
                <div key={key} className={styles.statCard}>
                    <div className={styles.statValue}>{stats[key]}</div>
                    <div className={styles.statLabel}>{label}</div>
                </div>
            ))}
        </div>
    );
}
