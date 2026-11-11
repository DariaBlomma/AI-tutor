import { APP_BOTTOM_NAV_ITEMS } from '@/shared/widgets/AppBottomNav/data';
import type { AppBottomNavActive, AppBottomNavProps } from '@/shared/widgets/AppBottomNav/types';
import { useSidebar } from '@/shared/hooks/useSidebar';
import styles from './AppSidebar.module.scss';
import { Link } from '@tanstack/react-router';

interface AppSidebarProps extends Omit<AppBottomNavProps, 'active'> {
    active: AppBottomNavActive;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
    return (
        <svg
            className={styles.chevronIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {direction === 'left' ? (
                <path d="M15 18l-6-6 6-6" />
            ) : (
                <path d="M9 18l6-6-6-6" />
            )}
        </svg>
    );
}

export function AppSidebar({ active, hiddenIds = [] }: AppSidebarProps) {
    const { collapsed, toggle } = useSidebar();

    const items = APP_BOTTOM_NAV_ITEMS.filter(({ id }) => !hiddenIds.includes(id));

    return (
        <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <button
                type="button"
                className={styles.toggleButton}
                onClick={toggle}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <ChevronIcon direction={collapsed ? 'right' : 'left'} />
            </button>

            <nav className={styles.nav}>
                {items.map(({ id, label, Icon, to }) => (
                    <Link
                        to={to}
                        key={id}
                        type="button"
                        className={`${styles.navItem} ${id === active ? styles.active : ''}`}
                    >
                        <Icon className={styles.navIcon} />
                        {!collapsed && <span className={styles.navLabel}>{label}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
