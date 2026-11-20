import styles from './StudentHomeworkProgressBar.module.scss';

export interface StudentHomeworkProgressBarProps {
    completed: number;
    total: number;
}

export function StudentHomeworkProgressBar({ completed, total }: StudentHomeworkProgressBarProps) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className={styles.progressBar}>
            <div className={styles.track}>
                <div
                    className={styles.fill}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className={styles.label}>
                {completed} / {total}
            </span>
        </div>
    );
}
