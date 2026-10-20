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

const routeTree = rootRoute.addChildren([indexRoute, registerRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
