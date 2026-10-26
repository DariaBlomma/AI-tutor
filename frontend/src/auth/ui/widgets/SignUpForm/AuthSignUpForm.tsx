import { type FormEvent } from 'react';
import { useController } from 'react-hook-form';

import { BaseButtonTrapezoid } from '@/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText.tsx';
import { BaseInputPassword } from '@/shared/ui-kit/BaseInputPassword/BaseInputPassword.tsx';
import { AuthTriangleFormLayout } from '../../layouts/AuthTriangleFormLayout/AuthTriangleFormLayout.tsx';
import { layoutFieldClass } from '../../layouts/AuthTriangleFormLayout/layoutFieldClass';
import { AuthRoleSwitch } from '../RoleSwitch/AuthRoleSwitch.tsx';
import { useAuthRegisterFormValidation } from '@/auth/hooks/useAuthRegisterFormValidation.ts';
import type { SignUpModel } from '@/auth/types/models';
import type { RegisterFormData } from '@/auth/types/ui';

import styles from './AuthSignUpForm.module.scss';

interface AuthSignUpFormProps {
    isPending: boolean;
    onSubmit: (payload: SignUpModel) => void;
}

// Форма регистрации в едином треугольном каркасе (как на странице входа):
// инпуты ui-kit, переключатель ролей, код учителя для учеников.
// Ошибки полей показывают сами инпуты ui-kit, серверная ошибка — на уровне лэйаута.
export function AuthSignUpForm({ isPending, onSubmit }: AuthSignUpFormProps) {
    const { fields, form, handleSubmit } = useAuthRegisterFormValidation();

    // Роль живёт в форме через useController — единый источник состояния.
    const { field: roleField } = useController<RegisterFormData, 'role'>({
        control: form.control,
        name: 'role',
    });

    const mapToModel = (data: RegisterFormData): SignUpModel => ({
        // Маппинг полей формы -> контракт бэкенда (SignUpRequest).
        userName: data.user.trim(),
        email: data.email.trim(),
        password: data.pass,
        firstName: data.first.trim(),
        lastName: data.last.trim(),
        role: data.role,
        teacherCode: data.role === 'STUDENT' ? data.teacherCode.trim() : undefined,
    });

    const onFormSubmit = handleSubmit((data) => onSubmit(mapToModel(data)));

    return (
        <AuthTriangleFormLayout
            onSubmit={(e: FormEvent) => void onFormSubmit(e)}
            button={
                <BaseButtonTrapezoid
                    label={isPending ? 'Отправка…' : 'Регистрация'}
                    variant="filled"
                    disabled={isPending}
                    type="submit"
                />
            }
        >
            {/* Поля верхнего треугольника */}
            <BaseInputPassword
                className={`${layoutFieldClass} ${styles.inputPass}`}
                placeholder="Пароль"
                autoComplete="new-password"
                {...fields.pass.props}
            />
            <BaseInputPassword
                className={`${layoutFieldClass} ${styles.inputConfirm}`}
                placeholder="Подтверждение пароля"
                autoComplete="new-password"
                {...fields.confirm.props}
            />
            <BaseInputText
                className={`${layoutFieldClass} ${styles.inputUser}`}
                placeholder="Логин"
                autoComplete="username"
                {...fields.user.props}
            />
            <BaseInputText
                className={`${layoutFieldClass} ${styles.inputFirst}`}
                placeholder="Имя"
                autoComplete="given-name"
                {...fields.first.props}
            />
            <BaseInputText
                className={`${layoutFieldClass} ${styles.inputLast}`}
                placeholder="Фамилия"
                autoComplete="family-name"
                {...fields.last.props}
            />
            <BaseInputText
                className={`${layoutFieldClass} ${styles.inputEmail}`}
                inputMode="email"
                placeholder="Электронная почта"
                autoComplete="email"
                {...fields.email.props}
            />

            {/* Треугольник-переключатель Учитель/Ученик */}
            <AuthRoleSwitch role={roleField.value} onChange={(r) => roleField.onChange(r)} />

            {/* Код учителя — только для учеников (трапеция из макета) */}
            {roleField.value === 'STUDENT' && (
                <div className={styles.btnCodeWrap}>
                    <svg className={styles.btnCodeBorder} viewBox="0 0 199 36" preserveAspectRatio="none">
                        <path
                            d="M 23 0 L 176 0 L 199 36 L 0 36 Z"
                            fill="none"
                            stroke="#9D7CF2"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        className={styles.inputCode}
                        type="text"
                        placeholder="Код учителя"
                        {...fields.teacherCode.props}
                    />
                </div>
            )}
        </AuthTriangleFormLayout>
    );
}
