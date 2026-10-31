import { api } from '@/core/api/AxiosInstance';
import type { PageDto, TaskCreateRequestDto, TaskResponseDto, TaskUpdateRequestDto, TaskUsageDto, TasksQueryParams, TaskSummary } from '@/tasks/types';

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

    /** PUT /api/tasks/{id} -> TaskResponse — редактирование задания (бэк проверяет владение, 403 для чужих). */
    static async updateTask(id: number, payload: TaskUpdateRequestDto): Promise<TaskResponseDto> {
        const response = await api.put<TaskResponseDto>(`${TASKS_PATH}/${id}`, payload);
        return response.data;
    }

    /** DELETE /api/tasks/{id} -> 204. Бэк проверяет владение (403 для чужих заданий). */
    static async deleteTask(id: number): Promise<void> {
        await api.delete<void>(`${TASKS_PATH}/${id}`);
    }

    /** GET /api/tasks/by-public-id/{publicId} -> TaskResponse — страница просмотра задания. */
    static async getTaskByPublicId(publicId: string): Promise<TaskResponseDto> {
        const response = await api.get<TaskResponseDto>(`${TASKS_PATH}/by-public-id/${encodeURIComponent(publicId)}`);
        return response.data;
    }

    /**
     * GET /api/tasks/by-public-id/{publicId}/usage -> TaskUsageResponse — назначено/решено ли задание.
     * Страница редактирования блокирует по нему содержательные поля (бэк проверяет это же при PUT — 400).
     */
    static async getTaskUsage(publicId: string): Promise<TaskUsageDto> {
        const response = await api.get<TaskUsageDto>(`${TASKS_PATH}/by-public-id/${encodeURIComponent(publicId)}/usage`);
        return response.data;
    }
}
