import { HomeworkItem } from '@/student/ui/components/HomeworkItem/HomeworkItem';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';
import styles from './HomeworkList.module.scss';

export interface HomeworkListProps {
    works: StudentWorkResponse[];
    isLoading: boolean;
    onItemPress: (workId: number) => void;
}

export function HomeworkList({ works, isLoading, onItemPress }: HomeworkListProps) {
    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Loader />
            </div>
        );
    }

    if (works.length === 0) {
        return (
            <div className={styles.empty}>
                Нет заданий
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {works.map((work) => (
                <HomeworkItem
                    key={work.id}
                    work={work}
                    onClick={() => onItemPress(work.id)}
                />
            ))}
        </div>
    );
}
