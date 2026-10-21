import {Link, useSearch} from '@tanstack/react-router';

import { AuthResetPasswordForm } from 'src/auth/ui/ResetPasswordForm/AuthResetPasswordForm.tsx';
import { useAuthResetPassword } from 'src/auth/hooks/useAuthResetPassword.ts';

import styles from './AuthResetPasswordView.module.scss';

export function AuthResetPasswordView() {
    const search = useSearch({ from: '/auth/reset-password' }) as { token?: string };
    // token из query-параметра URL письма; при его отсутствии показываем ошибку
    const token = search?.token || "";
    const { resetPassword, isPending, serverError } = useAuthResetPassword(token ?? '');

    if (!token) {
        return (
            <div className={styles.page}>
                <h1 className={styles.title}>Сброс пароля</h1>

                <p className={styles.tokenError}>
                    Ссылка недействительна: отсутствует токен восстановления.<br />
                    Запросите восстановление пароля заново.
                </p>

                <Link to="/auth/forgot-password" className={styles.navLink}>
                    Восстановить пароль
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Сброс пароля</h1>

            <AuthResetPasswordForm
                serverError={serverError}
                isPending={isPending}
                onSubmit={(data) => resetPassword(data)}
            />

            <Link to="/auth/login" className={styles.navLink}>
                Вернуться ко входу
            </Link>
        </div>
    );
}
