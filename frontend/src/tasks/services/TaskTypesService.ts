import { api } from '@/core/api/AxiosInstance';
import type { TaskType, TaskTypeRequestDto } from '@/tasks/types';

// Базовый путь контроллера учебных типов (TaskTypeController).
const TASK_TYPES_PATH = '/task-types';

// Справочник учебных типов заданий — CRUD (удаление = мягкое, на бэке DELETE /{id}).
export class TaskTypesService {
    static async getAll(): Promise<TaskType[]> {
        const response = await api.get<TaskType[]>(TASK_TYPES_PATH);
        return response.data;
    }

    static async create(name: string, description?: string): Promise<TaskType> {
        const body: TaskTypeRequestDto = { name, description };
        const response = await api.post<TaskType>(TASK_TYPES_PATH, body);
        return response.data;
    }

    static async update(id: number, name: string, description?: string): Promise<TaskType> {
        const body: TaskTypeRequestDto = { name, description };
        const response = await api.put<TaskType>(`${TASK_TYPES_PATH}/${id}`, body);
        return response.data;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${TASK_TYPES_PATH}/${id}`);
    }
}
