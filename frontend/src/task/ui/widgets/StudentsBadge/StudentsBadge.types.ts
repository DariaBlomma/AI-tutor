import type { TaskAssignmentDto } from '@/task/types';

export interface StudentsBadgeProps {
    /** Число активных назначений (для иконки). */
    count: number;
    /** Список учеников с активными назначениями (для попапа). */
    assignments: TaskAssignmentDto[] | null;
    /** Загрузка данных. */
    isLoading: boolean;
}
