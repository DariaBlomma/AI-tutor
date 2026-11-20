import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';
import type { StudentWorkCard } from '@/student/types/models/studentWorkCard';

// Преобразовать StudentWorkResponse → StudentWorkCard.
export function mapToStudentWorkCard(work: StudentWorkResponse): StudentWorkCard {
    return {
        id: work.id,
        taskPublicId: work.taskPublicId,
        taskName: work.taskName,
        status: work.status,
        rawStatus: work.status,
        deadline: work.deadline,
        createdAt: work.createdAt,
        completedAt: work.completedAt ?? null,
        levels: work.levels ?? null,
        taskTypes: work.taskTypes ?? null,
        topics: work.topics ?? null,
        itemTypes: work.itemTypes ?? null,
        isMixed: work.isMixed ?? null,
    };
}
