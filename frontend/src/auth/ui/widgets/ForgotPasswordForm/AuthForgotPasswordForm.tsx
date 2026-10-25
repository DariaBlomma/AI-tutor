import type { FormEvent } from 'react';

import { BaseButtonTrapezoid } from 'src/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { useAuthForgotPasswordFormValidation } from 'src/auth/hooks/useAuthForgotPasswordFormValidation.ts';
import type { ForgotPasswordFormData } from 'src/auth/types/ui';

import styles from './AuthForgotPasswordForm.module.scss';

interface AuthForgotPasswordFormProps {
    isPending: boolean;
    isSent: boolean;
    onSubmit: (data: ForgotPasswordFormData) => void;
}

// Каркас страницы восстановления пароля: два треугольника, поле email,
// нейтральная подсказка -> сообщение об успехе (как в макете).
export function AuthForgotPasswordForm({ isPending, isSent, onSubmit }: AuthForgotPasswordFormProps) {
    const { fields, handleSubmit } = useAuthForgotPasswordFormValidation();

    const onFormSubmit = handleSubmit((data) => onSubmit(data));

    return (
        <form className={styles.wrap} onSubmit={(e: FormEvent) => void onFormSubmit(e)}>
            <svg className={styles.triSvg} viewBox="0 0 320 520">
                <polygon className={styles.triPath} points="160,260 20,40 300,40" />
                <polygon className={styles.triPath} points="160,260 300,480 20,480" />
            </svg>

            <div className={styles.btnSubmit}>
                <BaseButtonTrapezoid
                    label={isPending ? 'Отправка…' : 'Отправить'}
                    variant="filled"
                    disabled={isPending || isSent}
                    type="submit"
                />
            </div>

            <input
                className={`${styles.field} ${styles.inputEmail}`}
                type="email"
                placeholder="email"
                autoComplete="email"
                {...fields.email.props}
            />

            {isSent ? (
                <p className={styles.successText}>
                    Если пользователь с таким email существует,<br />инструкция отправлена на почту
                </p>
            ) : (
                <p className={styles.hintText}>
                    Мы отправим инструкцию,<br />если этот email найден
                </p>
            )}
        </form>
    );
}
