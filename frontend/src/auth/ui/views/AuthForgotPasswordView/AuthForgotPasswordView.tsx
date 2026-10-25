import { Link } from '@tanstack/react-router';

import { AuthForgotPasswordForm } from '../../widgets/ForgotPasswordForm/AuthForgotPasswordForm.tsx';
import { useAuthForgotPassword } from 'src/auth/hooks/useAuthForgotPassword.ts';

import styles from './AuthForgotPasswordView.module.scss';

export function AuthForgotPasswordView() {
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
