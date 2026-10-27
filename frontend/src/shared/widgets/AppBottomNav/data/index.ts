import { IconBank, IconHome, IconProfile, IconReports } from '@/shared/icons';
import type { AppBottomNavItem } from '../types';

// Статичные данные нижней навигации приложения.
export const APP_BOTTOM_NAV_ITEMS: AppBottomNavItem[] = [
    { id: 'home', label: 'Главная', Icon: IconHome, to: "/" },
    { id: 'reports', label: 'Отчёты', Icon: IconReports, to: "/teacher/reports" },
    { id: 'bank', label: 'Банк заданий', Icon: IconBank, to: "/tasks-bank" },
    { id: 'profile', label: 'Профиль', Icon: IconProfile, to: "/profile" },
];
