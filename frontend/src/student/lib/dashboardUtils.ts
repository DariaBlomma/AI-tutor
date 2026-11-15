import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';
import type { MonthlyStats, DashboardAssignment } from '@/student/types/models/dashboard';

// Получить начало и конец текущего календарного месяца (timestamp в мс).
export function getMonthBounds(): { start: number; end: number } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    return { start, end };
}

// Преобразовать StudentWorkResponse → DashboardAssignment.
export function mapToDashboardAssignment(work: StudentWorkResponse): DashboardAssignment {
    return {
        id: work.id,
        taskPublicId: work.taskPublicId,
        taskName: work.taskName,
        status: work.status,
        rawStatus: work.status,
        deadline: work.deadline,
        levels: work.levels ?? null,
        taskTypes: work.taskTypes ?? null,
        topics: work.topics ?? null,
        itemTypes: work.itemTypes ?? null,
        isMixed: work.isMixed ?? null,
    };
}

// Посчитать monthly stats из списка всех DashboardAssignment.
// Фильтрация по deadline — работы, дедлайн которых попадает в текущий календарный месяц.
export function computeMonthlyStats(works: DashboardAssignment[]): MonthlyStats {
    const { start, end } = getMonthBounds();

    const monthWorks = works.filter(w => {
        if (!w.deadline) return false;
        const ts = new Date(w.deadline).getTime();
        return ts >= start && ts <= end;
    });

    return {
        completedCount: monthWorks.filter(w => w.rawStatus === 'COMPLETED').length,
        inProgressCount: monthWorks.filter(w => w.rawStatus === 'ASSIGNED' || w.rawStatus === 'IN_PROGRESS').length,
        overdueCount: monthWorks.filter(w => w.rawStatus === 'EXPIRED').length,
    };
}
