import {createRootRoute, redirect} from '@tanstack/react-router';
import {LayoutRoot} from "@/shared/layouts/LayoutRoot.tsx";
import {AuthService} from "@/auth/services/AuthService.ts";

export const Route = createRootRoute({
    loader: async () => {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.startsWith('/auth');

        // Единая проверка сессии при входе на сайт (см. AuthService.checkSession).
        const authenticated = await AuthService.checkSession();

        // Авторизованный пользователь не должен попадать на страницы авторизации — на главную.
        if (authenticated && isAuthPage) {
            throw redirect({ to: '/' });
        }

        // Неавторизованный пользователь за пределами auth-страниц — на логин.
        if (!authenticated && !isAuthPage) {
            throw redirect({ to: '/auth/login' });
        }

        return {};
    },
    component: LayoutRoot,
});