import { type FormEvent } from 'react';

import { BaseButtonTrapezoid } from '@/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { BaseInputPassword } from '@/shared/ui-kit/BaseInputPassword/BaseInputPassword.tsx';
import { AuthTriangleFormLayout } from '@/auth/layouts/AuthTriangleFormLayout/AuthTriangleFormLayout.tsx';
import { layoutFieldClass } from '@/auth/layouts/AuthTriangleFormLayout/layoutFieldClass';
import { useAuthResetPasswordFormValidation } from '@/auth/hooks/useAuthResetPasswordFormValidation.ts';
import type { ResetPasswordFormData } from '@/auth/types/ui';

import styles from './AuthResetPasswordForm.module.scss';

interface AuthResetPasswordFormProps {
    isPending: boolean;
    onSubmit: (data: ResetPasswordFormData) => void;
}

// Форма сброса пароля в едином треугольном каркасе (как на странице входа):
// новый пароль — в верхнем треугольнике, подтверждение — в нижнем.
// Ошибки полей показываются самими инпутами ui-kit, серверная ошибка — на уровне лэйаута.
export function AuthResetPasswordForm({ isPending, onSubmit }: AuthResetPasswordFormProps) {
    const { fields, handleSubmit } = useAuthResetPasswordFormValidation();

    const onFormSubmit = handleSubmit((data) => onSubmit(data));

    return (
        <AuthTriangleFormLayout
            onSubmit={(e: FormEvent) => void onFormSubmit(e)}
            button={
                <BaseButtonTrapezoid
                    label={isPending ? 'Отправка…' : 'Сохранить'}
                    variant="filled"
                    disabled={isPending}
                    type="submit"
                />
            }
        >
            <BaseInputPassword
                className={`${layoutFieldClass} ${styles.inputPass}`}
                placeholder="Новый пароль"
                autoComplete="new-password"
                {...fields.pass.props}
            />

            <BaseInputPassword
                className={`${layoutFieldClass} ${styles.inputConfirm}`}
                placeholder="Подтверждение пароля"
                autoComplete="new-password"
                {...fields.confirm.props}
            />
        </AuthTriangleFormLayout>
    );
}
