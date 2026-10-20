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

const routeTree = rootRoute.addChildren([indexRoute, registerRoute, loginRoute, forgotPasswordRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
