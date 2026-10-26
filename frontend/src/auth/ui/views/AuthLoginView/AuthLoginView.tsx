import { Link } from '@tanstack/react-router';

import { AuthLayout } from '@/shared/layouts/AuthLayout.tsx';
import { AuthLoginForm } from '../../widgets/LoginForm/AuthLoginForm.tsx';
import { useAuthLogin } from '@/auth/hooks/useAuthLogin.ts';

import layoutStyles from '@/shared/layouts/AuthLayout.module.scss';

export function AuthLoginView() {
    const { login, isPending, serverError } = useAuthLogin();

    return (
        <AuthLayout
            title="TutorAI"
            footer={
                <>
                    <Link to="/auth/sign-up" className={layoutStyles.navLink}>
                        Регистрация
                    </Link>

                    <Link to="/auth/forgot-password" className={layoutStyles.navLink}>
                        Забыли пароль?
                    </Link>
                </>
            }
        >
            <AuthLoginForm
                serverError={serverError}
                isPending={isPending}
                onSubmit={(data) => login(data)}
            />
        </AuthLayout>
    );
}
