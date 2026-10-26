// Типы виджета нижней навигации приложения.

import type { IconProps } from '@/shared/icons';

export type AppBottomNavActive = 'home' | 'reports' | 'bank' | 'profile';

export interface AppBottomNavItem {
    id: AppBottomNavActive;
    label: string;
    Icon: (props: IconProps) => React.JSX.Element;
}

export interface AppBottomNavProps {
    active: AppBottomNavActive;
}
