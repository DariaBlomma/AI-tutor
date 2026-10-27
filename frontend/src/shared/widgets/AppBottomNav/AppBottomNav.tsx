import { APP_BOTTOM_NAV_ITEMS } from './data';
import type { AppBottomNavProps } from './types';
import styles from './AppBottomNav.module.scss';
import {Link} from "@tanstack/react-router";

// Нижнее меню всего приложения — переиспользуется на всех страницах,
// поэтому рендерится один раз в LayoutRoot (активный пункт берётся из текущего маршрута).
export function AppBottomNav({ active }: AppBottomNavProps) {
    return (
        <nav className={styles.bottomNav}>
            {APP_BOTTOM_NAV_ITEMS.map(({ id, label, Icon, to }) => (
               <Link
                    to={to}
                    key={id}
                    type="button"
                    className={`${styles.navItem} ${id === active ? styles.active : ''}`}
               >

                   <Icon className={styles.navIcon}/>
                   <span className={styles.navLabel}>{label}</span>
               </Link>
            ))}
        </nav>
    );
}
