import { Outlet, useLocation } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { AppBottomNav } from '@/shared/widgets/AppBottomNav/AppBottomNav';
import { AppSidebar } from '@/shared/widgets/AppSidebar/AppSidebar';
import { useSidebar } from '@/shared/hooks/useSidebar';
import type { AppBottomNavActive } from '@/shared/widgets/AppBottomNav/types';
import { useEffect, useState } from 'react';

// Активный пункт нижнего меню по текущему маршруту.
const NAV_ACTIVE_BY_PATH: Record<string, AppBottomNavActive> = {
    '/': 'home',
    '/teacher/reports': 'reports',
    // Страницы банка заданий (список, просмотр задания, создание, справочники) — под общим нижним меню.
    '/tasks-bank': 'bank',
    '/profile': 'profile',
};

const DESKTOP_BREAKPOINT = 1024;

function useIsDesktop(): boolean {
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== 'undefined' && window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches
    );

    useEffect(() => {
        const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return isDesktop;
}

export function LayoutRoot() {
    const pathname = useLocation({ select: (location) => location.pathname });
    const isDesktop = useIsDesktop();
    const { collapsed } = useSidebar();
    // Дочерние маршруты наследуют активный пункт родителя (уровень 2/3 отчётов -> «Отчёты»).
    const navActive =
        NAV_ACTIVE_BY_PATH[pathname] ??
        Object.entries(NAV_ACTIVE_BY_PATH).find(([path]) => path !== '/' && pathname.startsWith(`${path}/`))?.[1];

    // Устанавливаем класс на body для управления padding через CSS.
    useEffect(() => {
        if (!isDesktop) return;
        try {
            document.body.classList.toggle('sidebar--collapsed', collapsed);
        } catch { /* ignore */ }
    }, [isDesktop, collapsed]);

    const isTeacher = AuthService.getUserRole() === 'TEACHER';
    const hiddenIds: AppBottomNavActive[] = isTeacher ? [] : ['bank'];

    return (
        <main className={`main ${isDesktop ? 'main--with-sidebar' : ''}`}>
            {isDesktop && navActive && (
                <AppSidebar active={navActive} hiddenIds={hiddenIds} />
            )}
            <Outlet />
            {!isDesktop && navActive && (
                <AppBottomNav active={navActive} hiddenIds={hiddenIds} />
            )}
        </main>
    );
}
