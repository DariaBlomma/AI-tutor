import { type FormEvent } from 'react';

import { BaseButtonTrapezoid } from '@/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText.tsx';
import { BaseInputPassword } from '@/shared/ui-kit/BaseInputPassword/BaseInputPassword.tsx';
import { AuthTriangleFormLayout } from '@/auth/layouts/AuthTriangleFormLayout/AuthTriangleFormLayout.tsx';
import { layoutFieldClass } from '@/auth/layouts/AuthTriangleFormLayout/layoutFieldClass';
import { useAuthLoginFormValidation } from '@/auth/hooks/useAuthLoginFormValidation.ts';
import type { LoginFormData } from '@/auth/types/ui';

import styles from './AuthLoginForm.module.scss';

interface AuthLoginFormProps {
    serverError: string | null;
    isPending: boolean;
    onSubmit: (data: LoginFormData) => void;
}

export function AuthLoginForm({ serverError, isPending, onSubmit }: AuthLoginFormProps) {
    const { fields, handleSubmit } = useAuthLoginFormValidation();

    const onFormSubmit = handleSubmit((data) => onSubmit(data));

    return (
        <AuthTriangleFormLayout
            onSubmit={(e: FormEvent) => void onFormSubmit(e)}
            button={
                <BaseButtonTrapezoid
                    label={isPending ? 'Отправка…' : 'Войти'}
                    variant="filled"
                    disabled={isPending}
                    type="submit"
                />
            }
        >
            {/* Поле логина */}
            <BaseInputText
                className={`${layoutFieldClass} ${styles.inputUser}`}
                placeholder="Логин"
                autoComplete="username"
                {...fields.userName.props}
            />

            {/* Поле пароля с встроенной иконкой глаза */}
            <BaseInputPassword
                className={`${layoutFieldClass} ${styles.inputPass}`}
                placeholder="Пароль"
                autoComplete="current-password"
                {...fields.password.props}
            />

            {/* Глобальная ошибка сервера */}
            {serverError && (
                <div className={styles.errors}>
                    <p className={styles.serverError}>{serverError}</p>
                </div>
            )}
        </AuthTriangleFormLayout>
    );
}