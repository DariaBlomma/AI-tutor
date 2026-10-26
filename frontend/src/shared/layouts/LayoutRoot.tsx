import { Outlet, useLocation } from '@tanstack/react-router';
import { AppBottomNav } from '@/shared/widgets/AppBottomNav/AppBottomNav';
import type { AppBottomNavActive } from '@/shared/widgets/AppBottomNav/types';

// Активный пункт нижнего меню по текущему маршруту.
const NAV_ACTIVE_BY_PATH: Record<string, AppBottomNavActive> = {
    '/': 'home',
    '/teacher/reports': 'reports',
    '/bank': 'bank',
    '/profile': 'profile',
};

export function LayoutRoot() {
    const pathname = useLocation({ select: (location) => location.pathname });
    // Дочерние маршруты наследуют активный пункт родителя (уровень 2/3 отчётов -> «Отчёты»).
    const navActive =
        NAV_ACTIVE_BY_PATH[pathname] ??
        Object.entries(NAV_ACTIVE_BY_PATH).find(([path]) => path !== '/' && pathname.startsWith(`${path}/`))?.[1];

    return (
        <main className="main">
            <Outlet />
            {/* Нижнее меню — общий элемент всего приложения, рендерится один раз здесь. */}
            {navActive && <AppBottomNav active={navActive}/>}
        </main>
    );
}
