import { useLocation } from '@tanstack/react-router';
import styles from './StudentBottomNavigation.module.scss';

type NavRoute = '/' | '/student/homework' | '/profile';

const NAV_ITEMS: Array<{ route: NavRoute; icon: string; label: string }> = [
    { route: '/', icon: 'i-home', label: 'Главная' },
    { route: '/student/homework', icon: 'i-hw', label: 'ДЗ' },
    { route: '/profile', icon: 'i-profile', label: 'Профиль' },
];

export function StudentBottomNavigation() {
    const { pathname } = useLocation();
    const activeRoute = pathname as NavRoute;

    return (
        <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => {
                const isActive = activeRoute === item.route;
                return (
                    <a
                        key={item.route}
                        href={item.route}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <svg className={styles.navIcon}>
                            <use href={`#${item.icon}`} />
                        </svg>
                        <span className={styles.navLabel}>{item.label}</span>
                    </a>
                );
            })}
        </nav>
    );
}
