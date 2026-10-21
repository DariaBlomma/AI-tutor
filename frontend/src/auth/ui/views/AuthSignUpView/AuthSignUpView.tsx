import { Link } from '@tanstack/react-router';

import { AuthTriangleForm } from '@/auth/ui/TriangleForm/AuthTriangleForm.tsx';
import { useAuthRegister } from '@/auth/hooks/useAuthRegister.ts';
import type { SignUpModel } from '@/auth/types/models';

import styles from './AuthSignUpView.module.scss';

export function AuthSignUpView() {
    const { register, isPending, serverError, isSuccess } = useAuthRegister();

    const handleSubmit = (payload: SignUpModel) => register(payload);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>TutorAI</h1>

            {isSuccess && (
                <p className={styles.success}>Регистрация завершена. Перенаправление…</p>
            )}

            <AuthTriangleForm
                serverError={serverError}
                isPending={isPending}
                onSubmit={handleSubmit}
            />

            <Link to="/auth/login" className={styles.navLogin}>
                Войти
            </Link>
        </div>
    );
}
