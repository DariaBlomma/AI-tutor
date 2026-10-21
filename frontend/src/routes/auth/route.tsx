import { createFileRoute, Outlet } from '@tanstack/react-router';
import styles from './auth-layout.module.scss';

export const Route = createFileRoute('/auth')({
    component: AuthLayout,
});

function AuthLayout() {
    return (
        <div className={styles.page}>
            <Outlet />
        </div>
    );
}