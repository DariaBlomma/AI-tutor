import { StudentHomeworkItem } from '@/student/ui/base/StudentHomeworkItem/StudentHomeworkItem.tsx';
import { Loader } from '@/shared/ui-kit/Loader/Loader.tsx';
import styles from './StudentHomeworkList.module.scss';
import {StudentHomeworkListProps} from "@/student/types/ui";

export function StudentHomeworkList({ works, isLoading, onItemPress }: StudentHomeworkListProps) {
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
                <StudentHomeworkItem
                    key={work.id}
                    work={work}
                    onClick={() => onItemPress(work.id)}
                />
            ))}
        </div>
    );
}
