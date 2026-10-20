import type { UserRole } from '@/auth/types';

// Типы форм: состав полей может отличаться от контракта бэкенда
// (например, подтверждение пароля живёт только на фронте).
// Маппинг на модель — в хуках (useAuthRegister).

export interface RegisterFormData {
    pass: string;
    confirm: string;
    user: string;
    first: string;
    last: string;
    email: string;
    teacherCode: string;
    role: UserRole;
}

export interface LoginFormData {
    userName: string;
    password: string;
}
