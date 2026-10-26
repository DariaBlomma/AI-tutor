import type { UserRole } from '@/user/types';

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

export interface ForgotPasswordFormData {
    email: string;
}

// token приходит из query-параметра URL письма, не из полей формы
export interface ResetPasswordFormData {
    pass: string;
    confirm: string;
}
