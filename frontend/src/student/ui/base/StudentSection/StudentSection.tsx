import styles from './StudentSection.module.scss';

interface SectionProps {
    title: string;
    count: number;
    children: React.ReactNode;
}

export function StudentSection({ title, count, children }: SectionProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>{title}</div>
                {count > 0 && <div className={styles.countBadge}>{count}</div>}
            </div>
            <div className={styles.list}>
                {children}
            </div>
        </div>
    );
}
