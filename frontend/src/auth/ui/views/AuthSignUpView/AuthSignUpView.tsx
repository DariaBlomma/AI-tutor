import { Link } from '@tanstack/react-router';

import { AuthLayout } from '../../layouts/AuthLayout/AuthLayout.tsx';
import { AuthSignUpForm } from '../../widgets/SignUpForm/AuthSignUpForm.tsx';
import { useAuthRegister } from '@/auth/hooks/useAuthRegister.ts';
import type { SignUpModel } from '@/auth/types/models';

import layoutStyles from '../../layouts/AuthLayout/AuthLayout.module.scss';

export function AuthSignUpView() {
    const { register, isPending, serverError, isSuccess } = useAuthRegister();

    const handleSubmit = (payload: SignUpModel) => register(payload);

    return (
        <AuthLayout
            title="TutorAI"
            notice={
                <>
                    {isSuccess && (
                        <p className={layoutStyles.notice}>Регистрация завершена. Перенаправление…</p>
                    )}
                    {serverError && (
                        <p className={`${layoutStyles.notice} ${layoutStyles.noticeError}`}>{serverError}</p>
                    )}
                </>
            }
            footer={
                <Link to="/auth/login" className={layoutStyles.navLink}>
                    Войти
                </Link>
            }
        >
            <AuthSignUpForm
                isPending={isPending}
                onSubmit={handleSubmit}
            />
        </AuthLayout>
    );
}
