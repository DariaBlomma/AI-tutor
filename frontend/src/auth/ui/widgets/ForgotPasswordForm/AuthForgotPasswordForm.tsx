import { type FormEvent } from 'react';

import { BaseButtonTrapezoid } from '@/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText.tsx';
import { AuthTriangleFormLayout, layoutFieldClass } from '@/auth/layouts/AuthTriangleFormLayout/AuthTriangleFormLayout.tsx';
import { useAuthForgotPasswordFormValidation } from '@/auth/hooks/useAuthForgotPasswordFormValidation.ts';
import type { ForgotPasswordFormData } from '@/auth/types/ui';

import styles from './AuthForgotPasswordForm.module.scss';

interface AuthForgotPasswordFormProps {
    isPending: boolean;
    onSubmit: (data: ForgotPasswordFormData) => void;
}

// Форма восстановления пароля в едином треугольном каркасе (как на странице входа).
export function AuthForgotPasswordForm({ isPending, onSubmit }: AuthForgotPasswordFormProps) {
    const { fields, handleSubmit } = useAuthForgotPasswordFormValidation();

    const onFormSubmit = handleSubmit((data) => onSubmit(data));

    return (
        <AuthTriangleFormLayout
            onSubmit={(e: FormEvent) => void onFormSubmit(e)}
            button={
                <BaseButtonTrapezoid
                    label={isPending ? 'Отправка…' : 'Отправить'}
                    variant="filled"
                    disabled={isPending}
                    type="submit"
                />
            }
        >
            <BaseInputText
                className={`${layoutFieldClass} ${styles.inputEmail}`}
                inputMode="email"
                placeholder="Электронная почта"
                autoComplete="email"
                {...fields.email.props}
            />

            {/* Нейтральная подсказка (существование аккаунта не раскрываем) */}
            <p className={styles.hintText}>
                Мы отправим инструкцию,<br />если этот email найден
            </p>
        </AuthTriangleFormLayout>
    );
}
