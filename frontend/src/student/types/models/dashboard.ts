import type { WorkStatus } from '@/student/types/work';

// Одно назначение для дашборда (обогащённые данные из StudentWorkResponse).
export interface DashboardAssignment {
    id: number;
    taskPublicId: string;
    taskName: string;
    status: WorkStatus;
    rawStatus: WorkStatus;
    deadline: string | null; // ISO-8601
    createdAt: string; // ISO-8601, date when assignment was created
    completedAt: string | null; // ISO-8601, date when assignment was completed
    teacherName?: string | null;
    // Чипы задания (как в TaskSummaryResponse)
    levels?: string[] | null;
    taskTypes?: Array<{ id: number; name: string; description: string | null; isActive: boolean }> | null;
    topics?: Array<{ id: number; name: string }> | null;
    itemTypes?: string[] | null;
    isMixed?: boolean | null;
}
