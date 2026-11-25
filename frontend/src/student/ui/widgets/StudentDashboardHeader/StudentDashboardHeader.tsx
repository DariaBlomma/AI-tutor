import { useUserProfile } from '@/user/hooks/useUserProfile.ts';
import styles from './StudentDashboardHeader.module.scss';

export function StudentDashboardHeader() {
    const { data: profile, isPending } = useUserProfile();

    const displayName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.userName
        : '';

    if (isPending) return <div className={styles.header}>Загрузка...</div>;

    return (
        <div className={styles.header}>
            <h1>Привет, {displayName}</h1>
        </div>
    );
}
