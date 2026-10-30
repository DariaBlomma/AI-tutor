// Типы виджета нижней навигации приложения.

import type { IconProps } from '@/shared/icons';

export type AppBottomNavActive = 'home' | 'reports' | 'bank' | 'profile';

export interface AppBottomNavItem {
    id: AppBottomNavActive;
    label: string;
    Icon: (props: IconProps) => React.JSX.Element;
    to: string
}

export interface AppBottomNavProps {
    active: AppBottomNavActive;
    /** Пункты, которые нужно скрыть (напр. «bank» для ученика — раздел доступен только учителю). */
    hiddenIds?: AppBottomNavActive[];
}
