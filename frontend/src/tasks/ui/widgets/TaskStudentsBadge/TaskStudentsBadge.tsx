import { StudentsBadge } from '../StudentsBadge/StudentsBadge';
import { useTaskAssignments } from '@/tasks/hooks/useTaskAssignments';

interface TaskStudentsBadgeProps {
    taskId: number;
}

/**
 * Обёртка для StudentsBadge: загружает список учеников с активными назначениями
 * через useTaskAssignments и передаёт данные в UI-компонент.
 */
export function TaskStudentsBadge({ taskId, className }: TaskStudentsBadgeProps) {
    const { assignments, isLoading } = useTaskAssignments(taskId);

    const count = assignments?.length ?? 0;

    return (
        <StudentsBadge
            className={className}
            count={count}
            assignments={assignments}
            isLoading={isLoading}
        />
    );
}
