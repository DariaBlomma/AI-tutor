import { StudentAssignmentBadgeBase } from '@/student/ui/base/StudentAssignmentBadgeBase/StudentAssignmentBadgeBase.tsx';
import { useTaskAssignments } from '@/task/hooks/useTaskAssignments';
import type { StudentAssignmentBadgeItem } from '@/student/types/ui/student-assignment-badge-base.ts';

export interface StudentAssignmentBadgeContainerProps {
    taskId: number;
}

/**
 * Обёртка для StudentAssignmentBadgeBase: загружает список учеников с активными назначениями
 * через useTaskAssignments и передаёт данные в UI-компонент.
 */
export function StudentAssignmentBadgeContainer({ taskId }: StudentAssignmentBadgeContainerProps) {
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
