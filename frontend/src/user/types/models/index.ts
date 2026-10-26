// Контракты бэкенда (см. com.aitutor.backend.dto.user).

export type UserRole = 'TEACHER' | 'STUDENT';

// GET /api/user/me -> UserResponse
export interface UserProfile {
    id: number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    teacherCode?: string | null;
}
