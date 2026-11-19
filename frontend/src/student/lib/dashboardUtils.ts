import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';
import type { DashboardAssignment } from '@/student/types/models/dashboard';

// Преобразовать StudentWorkResponse → DashboardAssignment.
export function mapToDashboardAssignment(work: StudentWorkResponse): DashboardAssignment {
    return {
        id: work.id,
        taskPublicId: work.taskPublicId,
        taskName: work.taskName,
        status: work.status,
        rawStatus: work.status,
        deadline: work.deadline,
        createdAt: work.createdAt,
        levels: work.levels ?? null,
        taskTypes: work.taskTypes ?? null,
        topics: work.topics ?? null,
        itemTypes: work.itemTypes ?? null,
        isMixed: work.isMixed ?? null,
    };
}
