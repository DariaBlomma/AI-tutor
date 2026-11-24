import { AuthService } from '@/auth/services/AuthService';

/** Возвращает true, если текущий пользователь — учитель. */
export function useIsTeacher(): boolean {
    return AuthService.getUserRole() === 'TEACHER';
}
