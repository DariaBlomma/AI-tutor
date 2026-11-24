import { StudentsBadge } from '@/task/ui/widgets/StudentsBadge';
import { useTaskAssignments } from '@/task/hooks/useTaskAssignments';

interface TaskStudentsBadgeProps {
    taskId: number;
    publicId: string;
}

/**
 * Wrapper для StudentsBadge на уровне карточки задания.
 * Загружает список назначений и передаёт в StudentsBadge.
 */
export function TaskStudentsBadge({ taskId, publicId }: TaskStudentsBadgeProps) {
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
