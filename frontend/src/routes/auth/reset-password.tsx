import { createFileRoute } from '@tanstack/react-router';
import {AuthResetPasswordView} from "@/auth/ui/views/AuthResetPasswordView/AuthResetPasswordView.tsx";

export const Route = createFileRoute('/auth/reset-password')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            token: (search.token as string) || '',
        };
    },

    component: AuthResetPasswordView,
});