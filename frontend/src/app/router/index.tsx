import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { PlaceholderPage } from '@/app/router/PlaceholderPage.tsx';

const rootRoute = createRootRoute();

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: PlaceholderPage,
});

async function loadRegisterRoute() {
    const { AuthRegisterPage } = await import('@/auth/views/AuthRegisterPage/AuthRegisterPage.tsx');
    return { default: AuthRegisterPage };
}

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/register',
    component: loadRegisterRoute,
});

async function loadLoginRoute() {
    const { AuthLoginPage } = await import('@/auth/views/AuthLoginPage/AuthLoginPage.tsx');
    return { default: AuthLoginPage };
}

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/login',
    component: loadLoginRoute,
});

async function loadForgotPasswordRoute() {
    const { AuthForgotPasswordPage } = await import('@/auth/views/AuthForgotPasswordPage/AuthForgotPasswordPage.tsx');
    return { default: AuthForgotPasswordPage };
}

const forgotPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/forgot-password',
    component: loadForgotPasswordRoute,
});

async function loadResetPasswordRoute() {
    const { AuthResetPasswordPage } = await import('@/auth/views/AuthResetPasswordPage/AuthResetPasswordPage.tsx');
    return { default: AuthResetPasswordPage };
}

// URL из письма: /auth/reset-password?token=... (см. EmailService на бэке)
const resetPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/reset-password',
    component: loadResetPasswordRoute,
    validateSearch: (search: Record<string, unknown>): { token?: string } => ({
        token: typeof search.token === 'string' && search.token.length > 0 ? search.token : undefined,
    }),
});

const routeTree = rootRoute.addChildren([indexRoute, registerRoute, loginRoute, forgotPasswordRoute, resetPasswordRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
