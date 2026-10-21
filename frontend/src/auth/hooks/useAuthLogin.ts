import { useMutation } from '@tanstack/react-query';
import { AuthService } from '@/auth/services/AuthService';
import type {LoginFormData} from '@/auth/types';
import {extractErrorMessage} from "@/core/api/utils/errors.ts";
import type {AxiosError} from "axios";
import {useNavigate} from "@tanstack/react-router";

export function useAuthLogin() {
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: (data: LoginFormData) => {
            return  AuthService.login(data);
        },
        onSuccess: () => {
            navigate({ to: '/' });
        },
    });

    const serverError = mutation.error ? extractErrorMessage(mutation.error as AxiosError) : null;

    return {
        login: mutation.mutate,
        isPending: mutation.isPending,
        serverError,
        isSuccess: mutation.isSuccess,
    };
}
