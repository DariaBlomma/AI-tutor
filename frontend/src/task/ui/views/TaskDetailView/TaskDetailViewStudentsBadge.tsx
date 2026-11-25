import { StudentAssignmentBadgeBase } from '@/student/ui/base/StudentAssignmentBadgeBase/StudentAssignmentBadgeBase.tsx';
import { useTaskAssignments } from '@/task/hooks/useTaskAssignments';
import type { StudentAssignmentBadgeItem } from '@/student/types/ui/student-assignment-badge-base.ts';

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

    const items: StudentAssignmentBadgeItem[] | null = assignments?.map((a) => ({
        studentId: a.studentId,
        studentName: a.studentName,
        lastName: a.lastName ?? undefined,
    })) ?? null;

    return (
        <StudentAssignmentBadgeBase
            count={count}
            assignments={items}
            isLoading={isLoading}
        />
    );
}
