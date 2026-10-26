import { Outlet, useLocation } from '@tanstack/react-router';
import { AppBottomNav } from '@/shared/widgets/AppBottomNav/AppBottomNav';
import type { AppBottomNavActive } from '@/shared/widgets/AppBottomNav/types';

// Активный пункт нижнего меню по текущему маршруту.
const NAV_ACTIVE_BY_PATH: Record<string, AppBottomNavActive> = {
    '/': 'home',
    '/reports': 'reports',
    '/bank': 'bank',
    '/profile': 'profile',
};

export function LayoutRoot() {
    const pathname = useLocation({ select: (location) => location.pathname });
    const navActive = NAV_ACTIVE_BY_PATH[pathname];

    return (
        <main className="main">
            <Outlet />
            {/* Нижнее меню — общий элемент всего приложения, рендерится один раз здесь. */}
            {navActive && <AppBottomNav active={navActive}/>}
        </main>
    );
}
