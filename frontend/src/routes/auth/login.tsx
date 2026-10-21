import {createFileRoute, redirect} from '@tanstack/react-router';
import { AuthLoginView } from "../../auth/ui/views/AuthLoginView/AuthLoginView.tsx";
import {AuthService} from "@/auth/services/AuthService.ts";

export const Route = createFileRoute('/auth/login')({
    loader: async () => {
        if (AuthService.isAuthenticated) {
            throw redirect({ to: '/' });
        }

        return {};
    },
    component: () => (
            <AuthLoginView />
    ),
});