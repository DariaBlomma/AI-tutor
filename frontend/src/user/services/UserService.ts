import { api } from '@/core/api/AxiosInstance';
import type { UserProfile } from '@/user/types';

// Базовый путь контроллера пользователя — чтобы не повторять в эндпоинтах.
const USER_PATH = '/user';

// Работа с профилем пользователя (GET /api/user/me -> UserResponse).
export class UserService {
    static async getProfile(): Promise<UserProfile> {
        const response = await api.get<UserProfile>(`${USER_PATH}/me`);
        return response.data;
    }
}
