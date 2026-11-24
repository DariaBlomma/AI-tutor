import { StudentsBadge } from '@/task/ui/widgets/StudentsBadge';
import { useTaskAssignments } from '@/task/hooks/useTaskAssignments';

interface TaskDetailViewStudentsBadgeProps {
    taskId: number;
}

/**
 * Wrapper для StudentsBadge на странице просмотра задания.
 * Загружает список назначений и передаёт в StudentsBadge.
 */
export function TaskDetailViewStudentsBadge({ taskId }: TaskDetailViewStudentsBadgeProps) {
    const { assignments, isLoading } = useTaskAssignments(taskId);

    const count = assignments?.length ?? 0;

    return (
        <StudentsBadge
            count={count}
            assignments={assignments}
            isLoading={isLoading}
        />
    );
}
