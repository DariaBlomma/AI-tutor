import {createRootRoute, redirect} from '@tanstack/react-router';
import {LayoutRoot} from "@/shared/layouts/LayoutRoot.tsx";
import {AuthService} from "@/auth/services/AuthService.ts";

export const Route = createRootRoute({
    loader: async () => {
        const token = AuthService.token?.access;
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.startsWith('/auth');

        if (!token && !isAuthPage) {
            throw redirect({ to: '/auth/login' });
        }

        return {};
    },
    component: LayoutRoot,
});