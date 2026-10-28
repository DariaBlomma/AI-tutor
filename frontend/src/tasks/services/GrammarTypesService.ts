import { api } from '@/core/api/AxiosInstance';
import type { GrammarType, GrammarTypeRequestDto } from '@/tasks/types';

// Базовый путь контроллера грамматических типов (TaskTypeController).
const GRAMMAR_TYPES_PATH = '/task-types';

// Справочник грамматических типов заданий — CRUD (удаление = мягкое, на бэке DELETE /{id}).
export class GrammarTypesService {
    static async getAll(): Promise<GrammarType[]> {
        const response = await api.get<GrammarType[]>(GRAMMAR_TYPES_PATH);
        return response.data;
    }

    static async create(name: string, description?: string): Promise<GrammarType> {
        const body: GrammarTypeRequestDto = { name, description };
        const response = await api.post<GrammarType>(GRAMMAR_TYPES_PATH, body);
        return response.data;
    }

    static async update(id: number, name: string, description?: string): Promise<GrammarType> {
        const body: GrammarTypeRequestDto = { name, description };
        const response = await api.put<GrammarType>(`${GRAMMAR_TYPES_PATH}/${id}`, body);
        return response.data;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${GRAMMAR_TYPES_PATH}/${id}`);
    }
}
