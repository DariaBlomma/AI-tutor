import { type FormEvent } from 'react';

import { BaseButtonTrapezoid } from '@/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText.tsx';
import { BaseInputPassword } from '@/shared/ui-kit/BaseInputPassword/BaseInputPassword.tsx';
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
        <form className={styles.wrap} onSubmit={(e: FormEvent) => void onFormSubmit(e)}>
                <svg className={styles.triSvg} viewBox="0 0 320 520">
                <polygon className={styles.triPath} points="160,260 20,40 300,40" />
                <polygon className={styles.triPath} points="160,260 300,480 20,480" />
            </svg>

            <div className={styles.btnLogin}>
                <BaseButtonTrapezoid
                    label={isPending ? 'Отправка…' : 'Войти'}
                    variant="filled"
                    disabled={isPending}
                    type="submit"
                />
            </div>

            {/* Поле логина */}
            <BaseInputText
                className={styles.inputUser}
                placeholder="Логин"
                autoComplete="username"
                {...fields.userName.props}
            />

            {/* Поле пароля с встроенной иконкой глаза */}
            <BaseInputPassword
                className={styles.inputPass}
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
        </form>
    );
}