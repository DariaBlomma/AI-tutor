import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthService } from "@/auth/services/AuthService.ts";
import {AuthResetPasswordView} from "@/auth/ui/views/AuthResetPasswordView/AuthResetPasswordView.tsx";

export const Route = createFileRoute('/auth/reset-password')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            token: (search.token as string) || '',
        };
    },

    loader: async () => {
        if (AuthService.isAuthenticated) {
            throw redirect({ to: '/' });
        }
        return {};
    },

    component: AuthResetPasswordView,
});