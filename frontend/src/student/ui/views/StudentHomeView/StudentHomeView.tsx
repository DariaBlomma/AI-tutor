import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { useStudentDashboard } from '@/student/hooks/useStudentDashboard';
import { StudentDashboardHeader } from '@/student/ui/widgets/StudentDashboardHeader/StudentDashboardHeader.tsx';
import { StudentAssignmentList } from '@/student/ui/widgets/StudentAssignmentList/StudentAssignmentList.tsx';
import styles from './StudentHomeView.module.scss';

export function StudentHomeView() {
    const { block1, block2, isLoading, isError, error } = useStudentDashboard();

    return (
        <div className={styles.page}>
            {isLoading ? (
                <Loader active />
            ) : isError ? (
                <div className={styles.error}>
                    <p>Не удалось загрузить данные</p>
                    {error && <p className={styles.errorDetail}>{error}</p>}
                </div>
            ) : (
                <>
                    <StudentDashboardHeader />
                    <StudentAssignmentList block1={block1} block2={block2} isLoading={isLoading} />
                </>
            )}
        </div>
    );
}
