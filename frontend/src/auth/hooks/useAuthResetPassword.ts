import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { AuthService } from '@/auth/services/AuthService';
import type { ResetPasswordFormData, ResetPasswordModel } from '@/auth/types';
import { extractErrorMessage } from "@/core/api/utils/errors.ts";
import type { AxiosError } from "axios";

// token приходит из query-параметра URL письма (/auth/reset-password?token=...).
export function useAuthResetPassword(token: string) {
    const navigate = useNavigate();

    const mutation = useMutation({
        // Маппинг полей формы -> контракт бэкенда живёт здесь, а не в типе формы
        mutationFn: (data: ResetPasswordFormData) => {
            const payload: ResetPasswordModel = {
                token,
                newPassword: data.pass,
            };
            return AuthService.resetPassword(payload);
        },
        onSuccess: () => {
            // После успешного сброса — на страницу входа
            navigate({ to: '/auth/login' });
        },
    });

    const serverError = mutation.error ? extractErrorMessage(mutation.error as AxiosError) : null;

    return {
        resetPassword: mutation.mutate,
        isPending: mutation.isPending,
        serverError,
        isSuccess: mutation.isSuccess,
    };
}
