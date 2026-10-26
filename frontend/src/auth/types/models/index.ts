// Контракты бэкенда (см. com.aitutor.backend.dto.auth).

import type { UserRole } from '@/user/types';

export type { UserRole };

export interface JwtTokenMin {
    access: string;
    refresh: string;
    expires: string;
}

export interface AuthError {
    code?: string;
    message: string;
}

// POST /api/auth/signup -> 201 AuthResponse
export interface SignUpModel {
    userName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    teacherCode?: string;
}

// POST /api/auth/login -> 200 AuthResponse
export interface LoginModel {
    userName: string;
    password: string;
}

// POST /api/auth/forgot-password -> 204 No Content (см. ForgotPasswordRequest)
export interface ForgotPasswordModel {
    email: string;
}

// POST /api/auth/reset-password -> 200 OK (см. ResetPasswordRequest)
export interface ResetPasswordModel {
    token: string;
    newPassword: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    type: string;
    expiresAt: string;
    userName: string;
    userId: number;
    role: UserRole;
}
