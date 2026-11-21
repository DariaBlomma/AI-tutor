import { api } from '@/core/api/AxiosInstance';
import type { WorkStatus } from '@/student/types/work';

const STUDENT_PATH = '/student';

export interface StudentWorkResponse {
    id: number;
    taskId: number;
    taskPublicId: string;
    taskName: string;
    status: WorkStatus;
    deadline: string | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    levels?: string[] | null;
    taskTypes?: Array<{ id: number; name: string; description: string | null; isActive: boolean }> | null;
    topics?: Array<{ id: number; name: string }> | null;
    itemTypes?: string[] | null;
    isMixed?: boolean | null;
    /** Количество решённых пунктов. */
    completedItems?: number | null;
    /** Общее количество пунктов. */
    totalItems?: number | null;
}

export interface StudentWorkPage {
    content: StudentWorkResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface HomeworkFilters {
    page: number;
    size: number;
    sortBy?: 'deadline' | 'status' | 'createdAt';
    sortDirection?: 'asc' | 'desc';
    status?: WorkStatus;
    deadlineFrom?: string | null;
    deadlineTo?: string | null;
    deadlineExcludeFrom?: string | null;
    createdAtFrom?: string | null;
    completedAtFrom?: string | null;
    completedAtTo?: string | null;
}

/**
 * Сервис для дашборда ученика.
 * Использует существующие endpoint'ы бэкенда:
 * - GET /api/student/work — список заданий ученика (с фильтрацией)
 * - GET /api/student/me/progress — прогресс по активным заданиям
 */
export class StudentDashboardService {
    /** GET /api/student/work — задания ученика с пагинацией и фильтрацией. */
    static async getWorks(filters?: HomeworkFilters): Promise<StudentWorkPage> {
        const params = new URLSearchParams();
        params.append('page', String(filters?.page ?? 0));
        params.append('size', String(filters?.size ?? 100));
        if (filters?.sortBy) params.append('sort', filters.sortBy);
        if (filters?.sortDirection) params.append('direction', filters.sortDirection);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.deadlineFrom) params.append('deadlineFrom', filters.deadlineFrom);
        if (filters?.deadlineTo) params.append('deadlineTo', filters.deadlineTo);
        if (filters?.deadlineExcludeFrom) params.append('deadlineExcludeFrom', filters.deadlineExcludeFrom);
        if (filters?.createdAtFrom) params.append('createdAtFrom', filters.createdAtFrom);
        if (filters?.completedAtFrom) params.append('completedAtFrom', filters.completedAtFrom);
        if (filters?.completedAtTo) params.append('completedAtTo', filters.completedAtTo);

        const response = await api.get<StudentWorkPage>(`${STUDENT_PATH}/work`, {
            params: Object.fromEntries(params),
        });
        return response.data;
    }

    /** GET /api/student/me/progress — прогресс по активным заданиям. */
    static async getProgress() {
        const response = await api.get(`${STUDENT_PATH}/me/progress`);
        return response.data;
    }
}
