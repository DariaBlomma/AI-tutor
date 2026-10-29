import { api } from '@/core/api/AxiosInstance';
import type { PageDto, TaskCreateRequestDto, TaskResponseDto, TasksQueryParams, TaskSummary } from '@/tasks/types';

// Базовый путь контроллера заданий (TaskController, context-path /api уже в baseURL).
const TASKS_PATH = '/tasks';

// Банк заданий: список с фильтрами/пагинацией (только чтение) и создание.
export class TasksBankService {
    /**
     * GET /api/tasks -> Page<TaskSummaryResponse>.
     * Серверная пагинация: page/size; фильтры: search, taskTypeId, includeMixed.
     */
    static async getTasks(params?: TasksQueryParams): Promise<PageDto<TaskSummary>> {
        const response = await api.get<PageDto<TaskSummary>>(TASKS_PATH, { params });
        return response.data;
    }

    /** POST /api/tasks -> TaskResponse. */
    static async createTask(payload: TaskCreateRequestDto): Promise<TaskResponseDto> {
        const response = await api.post<TaskResponseDto>(TASKS_PATH, payload);
        return response.data;
    }

    /** DELETE /api/tasks/{id} -> 204. Бэк проверяет владение (403 для чужих заданий). */
    static async deleteTask(id: number): Promise<void> {
        await api.delete<void>(`${TASKS_PATH}/${id}`);
    }
}
