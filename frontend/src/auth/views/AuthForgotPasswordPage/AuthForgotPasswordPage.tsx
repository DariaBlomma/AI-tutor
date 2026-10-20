import { Link } from '@tanstack/react-router';

import { AuthForgotPasswordForm } from '@/auth/ui/ForgotPasswordForm/AuthForgotPasswordForm.tsx';
import { useAuthForgotPassword } from '@/auth/hooks/useAuthForgotPassword.ts';

import styles from './AuthForgotPasswordPage.module.scss';

export function AuthForgotPasswordPage() {
    const { forgotPassword, isPending, serverError, isSent } = useAuthForgotPassword();

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Восстановление пароля</h1>

            <AuthForgotPasswordForm
                isPending={isPending}
                isSent={isSent}
                onSubmit={(data) => forgotPassword(data)}
            />

            {serverError && <p className={styles.serverError}>{serverError}</p>}

            <Link to="/auth/login" className={styles.navLogin}>
                Вернуться ко входу
            </Link>
        </div>
    );
}
