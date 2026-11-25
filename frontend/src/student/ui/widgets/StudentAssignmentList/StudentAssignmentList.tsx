import { TaskAssignmentItem } from '@/task/ui/base/TaskAssignmentItem/TaskAssignmentItem.tsx';
import { Loader } from '@/shared/ui-kit/Loader/Loader.tsx';
import { StudentSection } from '@/student/ui/base/StudentSection/StudentSection.tsx';
import type { StudentAssignmentListProps } from '@/student/types/ui';
import styles from './StudentAssignmentList.module.scss';

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
                <StudentSection title="Нужно сделать" count={block1.length}>
                    {block1.map(card => (
                        <TaskAssignmentItem key={card.id} card={card} />
                    ))}
                </StudentSection>
            )}
            {block2.length > 0 && (
                <StudentSection title="Новые задания" count={block2.length}>
                    {block2.map(card => (
                        <TaskAssignmentItem key={card.id} card={card} />
                    ))}
                </StudentSection>
            )}
        </>
    );
}
