// Контракты бэкенда (см. com.aitutor.backend.dto.user).

import type { TeacherBrief } from '@/teacher/types/models';

export type UserRole = 'TEACHER' | 'STUDENT';

// GET /api/user/me -> UserResponse
export interface UserProfile {
    id: number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    // Код учителя (T-XXXXXX) — только для роли TEACHER; ученики получают null.
    teacherCode?: string | null;
    // Привязанный учитель — только для роли STUDENT; для TEACHER всегда null.
    teacher?: TeacherBrief | null;
}
