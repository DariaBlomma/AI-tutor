import { api } from '@/core/api/AxiosInstance';
import type { RefNameRequestDto, Topic } from '@/tasks/types';

// Базовый путь контроллера лексических тем (TopicController).
const TOPICS_PATH = '/topics';

// Справочник лексических тем — полный CRUD (временные кнопки на странице банка).
export class TopicsService {
    static async getAll(): Promise<Topic[]> {
        const response = await api.get<Topic[]>(TOPICS_PATH);
        return response.data;
    }

    static async create(name: string): Promise<Topic> {
        const body: RefNameRequestDto = { name };
        const response = await api.post<Topic>(TOPICS_PATH, body);
        return response.data;
    }

    static async update(id: number, name: string): Promise<Topic> {
        const body: RefNameRequestDto = { name };
        const response = await api.put<Topic>(`${TOPICS_PATH}/${id}`, body);
        return response.data;
    }

    static async remove(id: number): Promise<void> {
        await api.delete(`${TOPICS_PATH}/${id}`);
    }
}
