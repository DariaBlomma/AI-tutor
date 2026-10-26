import { Link, useSearch } from '@tanstack/react-router';

import { AuthLayout } from '@/shared/layouts/AuthLayout.tsx';
import { AuthResetPasswordForm } from '../../widgets/ResetPasswordForm/AuthResetPasswordForm.tsx';
import { useAuthResetPassword } from '@/auth/hooks/useAuthResetPassword.ts';

import layoutStyles from '@/shared/layouts/AuthLayout.module.scss';

export function AuthResetPasswordView() {
    const search = useSearch({ from: '/auth/reset-password' }) as { token?: string };
    // token из query-параметра URL письма; при его отсутствии показываем ошибку
    const token = search?.token || '';
    const { resetPassword, isPending, serverError } = useAuthResetPassword(token);

    if (!token) {
        return (
            <AuthLayout
                title="Сброс пароля"
                notice={
                    <p className={`${layoutStyles.notice} ${layoutStyles.noticeError}`}>
                        Ссылка недействительна: отсутствует токен восстановления.<br />
                        Запросите восстановление пароля заново.
                    </p>
                }
                footer={
                    <Link to="/auth/forgot-password" className={layoutStyles.navLink}>
                        Восстановить пароль
                    </Link>
                }
            >
                {null}
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Сброс пароля"
            notice={
                serverError ? (
                    <p className={`${layoutStyles.notice} ${layoutStyles.noticeError}`}>{serverError}</p>
                ) : undefined
            }
            footer={
                <Link to="/auth/login" className={layoutStyles.navLink}>
                    Вернуться ко входу
                </Link>
            }
        >
            <AuthResetPasswordForm
                isPending={isPending}
                onSubmit={(data) => resetPassword(data)}
            />
        </AuthLayout>
    );
}
