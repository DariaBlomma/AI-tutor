import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { AuthService } from '@/auth/services/AuthService';
import type { ForgotPasswordFormData } from '@/auth/types';
import { extractErrorMessage } from "@/core/api/utils/errors.ts";
import type { AxiosError } from "axios";

export function useAuthForgotPassword() {
    const [isSent, setIsSent] = useState(false);

    const mutation = useMutation({
        mutationFn: (data: ForgotPasswordFormData) => {
            return AuthService.forgotPassword(data);
        },
        onSuccess: () => {
            // По ТЗ показываем нейтральный успех: существование аккаунта не раскрываем.
            // Переход к вводу нового пароля — на следующей странице, её ещё нет.
            setIsSent(true);
        },
    });

    const serverError = mutation.error ? extractErrorMessage(mutation.error as AxiosError) : null;

    return {
        forgotPassword: mutation.mutate,
        isPending: mutation.isPending,
        serverError,
        isSent,
    };
}
