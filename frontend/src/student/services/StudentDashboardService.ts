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
    assignedAt: string;
    startedAt: string;
    completedAt: string;
    levels?: string[] | null;
    taskTypes?: Array<{ id: number; name: string; description: string | null; isActive: boolean }> | null;
    topics?: Array<{ id: number; name: string }> | null;
    itemTypes?: string[] | null;
    isMixed?: boolean | null;
}

export interface StudentWorkPage {
    content: StudentWorkResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

/**
 * Сервис для дашборда ученика.
 * Использует существующие endpoint'ы бэкенда:
 * - GET /api/student/work — список заданий ученика
 * - GET /api/student/me/progress — прогресс по активным заданиям
 */
export class StudentDashboardService {
    /** GET /api/student/work — все задания ученика (paginated). */
    static async getWorks(page = 0, size = 100): Promise<StudentWorkPage> {
        const response = await api.get<StudentWorkPage>(`${STUDENT_PATH}/work`, {
            params: { page, size },
        });
        return response.data;
    }

    /** GET /api/student/me/progress — прогресс по активным заданиям. */
    static async getProgress() {
        const response = await api.get(`${STUDENT_PATH}/me/progress`);
        return response.data;
    }
}
