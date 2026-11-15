import { useUserProfile } from '@/user/hooks/useUserProfile';
import styles from './StudentDashboardHeader.module.scss';
import { pluralizeTasks } from '@/student/utils';

interface StudentDashboardHeaderProps {
    assignedCount: number;
}

export function StudentDashboardHeader({ assignedCount }: StudentDashboardHeaderProps) {
    const { data: profile, isPending } = useUserProfile();

    const displayName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.userName
        : '';

    if (isPending) return <div className={styles.header}>Загрузка...</div>;

    const taskWord = pluralizeTasks(assignedCount);

    return (
        <div className={styles.header}>
            <h1>Привет, {displayName}</h1>
            {assignedCount > 0 && (
                <p>У вас {assignedCount} назначенных {taskWord}</p>
            )}
        </div>
    );
}
