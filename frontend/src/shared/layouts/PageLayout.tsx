import { Outlet } from '@tanstack/react-router';
import styles from './PageLayout.module.scss';

export function PageLayout() {
    return (
        <div className={styles.pageLayout}>
            <Outlet />
        </div>
    );
}
