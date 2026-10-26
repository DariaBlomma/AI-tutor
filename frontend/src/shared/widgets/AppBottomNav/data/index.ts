import { IconBank, IconHome, IconProfile, IconReports } from '@/shared/icons';
import type { AppBottomNavItem } from '../types';

// Статичные данные нижней навигации приложения.
export const APP_BOTTOM_NAV_ITEMS: AppBottomNavItem[] = [
    { id: 'home', label: 'Главная', Icon: IconHome },
    { id: 'reports', label: 'Отчёты', Icon: IconReports },
    { id: 'bank', label: 'Банк заданий', Icon: IconBank },
    { id: 'profile', label: 'Профиль', Icon: IconProfile },
];
