import { useMutation } from '@tanstack/react-query';
import { AuthService } from '@/auth/services/AuthService';
import type { SignUpModel } from '@/auth/types/models';
import {extractErrorMessage} from "@/core/api/utils/errors.ts";
import type {AxiosError} from "axios";
import {useNavigate} from "@tanstack/react-router";

export function useAuthRegister() {
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: (data: SignUpModel) => {
            return  AuthService.signUp(data);
        },
        onSuccess: () => {
            navigate({ to: '/' });
        },
    });

    const serverError = mutation.error ? extractErrorMessage(mutation.error as AxiosError) : null;

    return {
        register: mutation.mutate,
        isPending: mutation.isPending,
        serverError,
        isSuccess: mutation.isSuccess,
    };
}
