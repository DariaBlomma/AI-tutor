import type { DashboardAssignment } from '@/student/types/models/dashboard';
import { StudentAssignmentItem } from '@/student/ui/components/AssignmentItem/StudentAssignmentItem';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import styles from './StudentAssignmentList.module.scss';

interface StudentAssignmentListProps {
    assignments: DashboardAssignment[];
    isLoading: boolean;
}

export function StudentAssignmentList({ assignments, isLoading }: StudentAssignmentListProps) {
    const validAssignments = assignments.filter(a => a.taskName && a.deadline);

    if (isLoading) {
        return (
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Назначенные ДЗ</div>
                <Loader active />
            </div>
        );
    }

    if (validAssignments.length === 0) {
        return (
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Назначенные ДЗ</div>
                <p className={styles.empty}>Нет активных заданий</p>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>Назначенные ДЗ</div>
            <div className={styles.list}>
                {validAssignments.map(a => (
                    <StudentAssignmentItem key={a.id} assignment={a} />
                ))}
            </div>
        </div>
    );
}
