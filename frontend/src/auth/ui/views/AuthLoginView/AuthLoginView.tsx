import { Link } from '@tanstack/react-router';

import { AuthLoginForm } from '@/auth/ui/LoginForm/AuthLoginForm.tsx';
import { useAuthLogin } from '@/auth/hooks/useAuthLogin.ts';

import styles from './AuthLoginView.module.scss';

export function AuthLoginView() {
    const { login, isPending, serverError } = useAuthLogin();

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>TutorAI</h1>

            <AuthLoginForm
                serverError={serverError}
                isPending={isPending}
                onSubmit={(data) => login(data)}
            />

            <Link to="/auth/sign-up" className={styles.navRegister}>
                Регистрация
            </Link>

            <Link to="/auth/forgot-password" className={styles.navForgot}>
                Забыли пароль?
            </Link>
        </div>
    );
}
