import type { DashboardAssignment } from '@/student/types/models/dashboard';
import { StudentAssignmentItem } from '@/student/ui/components/AssignmentItem/StudentAssignmentItem';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import styles from './StudentAssignmentList.module.scss';

interface StudentAssignmentListProps {
    block1: DashboardAssignment[]; // «Нужно сделать»
    block2: DashboardAssignment[]; // «Новые задания»
    isLoading: boolean;
}

interface SectionProps {
    title: string;
    count: number;
    children: React.ReactNode;
}

function Section({ title, count, children }: SectionProps) {
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

export function StudentAssignmentList({ block1, block2, isLoading }: StudentAssignmentListProps) {
    const hasItems = block1.length > 0 || block2.length > 0;

    if (isLoading) {
        return (
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Нужно сделать</div>
                <Loader active />
            </div>
        );
    }

    if (!hasItems) {
        return (
            <div className={styles.section}>
                <div className={styles.emptyState}>
                    <p>На этой неделе всё под контролем.<br />Новых заданий пока нет.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {block1.length > 0 && (
                <Section title="Нужно сделать" count={block1.length}>
                    {block1.map(a => (
                        <StudentAssignmentItem key={a.id} assignment={a} />
                    ))}
                </Section>
            )}
            {block2.length > 0 && (
                <Section title="Новые задания" count={block2.length}>
                    {block2.map(a => (
                        <StudentAssignmentItem key={a.id} assignment={a} />
                    ))}
                </Section>
            )}
        </>
    );
}
