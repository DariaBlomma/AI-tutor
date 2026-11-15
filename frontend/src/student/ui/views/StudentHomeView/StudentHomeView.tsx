import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { useStudentDashboard } from '@/student/hooks/useStudentDashboard';
import { StudentDashboardHeader } from '@/student/ui/components/DashboardHeader/StudentDashboardHeader';
import { StudentStatCards } from '@/student/ui/components/StatCards/StudentStatCards';
import { StudentAssignmentList } from '@/student/ui/components/AssignmentList/StudentAssignmentList';
import styles from './StudentHomeView.module.scss';

export function StudentHomeView() {
    const { stats, assignments, isLoading, isError, error } = useStudentDashboard();

    const assignedCount = assignments.filter(a => a.rawStatus === 'ASSIGNED').length;

    return (
        <div className={styles.page}>
            {isLoading && !stats ? (
                <Loader active />
            ) : isError ? (
                <div className={styles.error}>
                    <p>Не удалось загрузить данные</p>
                    {error && <p className={styles.errorDetail}>{error}</p>}
                </div>
            ) : (
                <>
                    <StudentDashboardHeader assignedCount={assignedCount} />
                    {stats && <StudentStatCards stats={stats} />}
                    <StudentAssignmentList assignments={assignments} isLoading={isLoading} />
                </>
            )}
        </div>
    );
}
