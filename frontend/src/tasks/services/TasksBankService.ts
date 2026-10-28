import { api } from '@/core/api/AxiosInstance';
import type { TaskCreateRequestDto, TaskResponseDto, TaskSummary } from '@/tasks/types';

// Базовый путь контроллера заданий (TaskController, context-path /api уже в baseURL).
const TASKS_PATH = '/tasks';

// Банк заданий: список (только чтение) и создание.
export class TasksBankService {
    /** GET /api/tasks -> List<TaskSummaryResponse>. */
    static async getTasks(params?: { search?: string; taskTypeId?: number; includeMixed?: boolean }): Promise<TaskSummary[]> {
        const response = await api.get<TaskSummary[]>(TASKS_PATH, { params });
        return response.data;
    }

    /** POST /api/tasks -> TaskResponse. */
    static async createTask(payload: TaskCreateRequestDto): Promise<TaskResponseDto> {
        const response = await api.post<TaskResponseDto>(TASKS_PATH, payload);
        return response.data;
    }
}
