import { Link } from '@tanstack/react-router';

import { AuthLayout } from '../../layouts/AuthLayout/AuthLayout.tsx';
import { AuthForgotPasswordForm } from '../../widgets/ForgotPasswordForm/AuthForgotPasswordForm.tsx';
import { useAuthForgotPassword } from '@/auth/hooks/useAuthForgotPassword.ts';

import layoutStyles from '../../layouts/AuthLayout/AuthLayout.module.scss';
import styles from './AuthForgotPassword.module.scss';

export function AuthForgotPasswordView() {
    const { forgotPassword, isPending, serverError, isSent } = useAuthForgotPassword();

    return (
        <AuthLayout
            title="Восстановление пароля"
            notice={
                <>
                    {/* Сообщение об успехе: существование аккаунта не раскрываем */}
                    {isSent && (
                        <p className={layoutStyles.notice}>
                            Если пользователь с таким email существует,<br />инструкция отправлена на почту
                        </p>
                    )}
                    {serverError && (
                        <p className={`${layoutStyles.notice} ${layoutStyles.noticeError}`}>{serverError}</p>
                    )}
                </>
            }
            footer={
                <Link to="/auth/login" className={`${layoutStyles.navLink} ${styles.loginBtn}`}>
                    Вернуться ко входу
                </Link>
            }
        >
            <AuthForgotPasswordForm
                isPending={isPending}
                onSubmit={(data) => forgotPassword(data)}
            />
        </AuthLayout>
    );
}
