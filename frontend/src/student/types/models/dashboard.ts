import type { WorkStatus } from '@/student/types/work';

// Одно назначение для дашборда (обогащённые данные из StudentWorkResponse).
export interface DashboardAssignment {
    id: number;
    taskPublicId: string;
    taskName: string;
    status: WorkStatus;
    rawStatus: WorkStatus;
    deadline: string | null; // ISO-8601
    teacherName?: string | null;
    // Чипы задания (как в TaskSummaryResponse)
    levels?: string[] | null;
    taskTypes?: Array<{ id: number; name: string; description: string | null; isActive: boolean }> | null;
    topics?: Array<{ id: number; name: string }> | null;
    itemTypes?: string[] | null;
    isMixed?: boolean | null;
}

// Monthly stats — считаются на фронте из /student/work.
export interface MonthlyStats {
    completedCount: number;
    inProgressCount: number;
    overdueCount: number;
}
