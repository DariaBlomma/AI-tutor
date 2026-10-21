import { useState, type FormEvent } from 'react';
import { useController } from 'react-hook-form';

import { BaseButtonTrapezoid } from '@/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { AuthRoleSwitch } from '@/auth/ui/RoleSwitch/AuthRoleSwitch.tsx';
import { useAuthRegisterFormValidation } from '@/auth/hooks/useAuthRegisterFormValidation.ts';
import type { SignUpModel } from '@/auth/types/models';
import type { RegisterFormData } from '@/auth/types/ui';

import styles from './AuthTriangleForm.module.scss';

interface AuthTriangleFormProps {
    serverError: string | null;
    isPending: boolean;
    onSubmit: (payload: SignUpModel) => void;
}

// Каркас страницы регистрации: два треугольника, поля формы, переключатель ролей.
export function AuthTriangleForm({ serverError, isPending, onSubmit }: AuthTriangleFormProps) {
    const { fields, form, handleSubmit } = useAuthRegisterFormValidation();
    const [showPass, setShowPass] = useState(false);

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
        <form className={styles.wrap} onSubmit={(e: FormEvent) => void onFormSubmit(e)}>
            <svg className={styles.triSvg} viewBox="0 0 320 520">
                <polygon className={styles.triPath} points="160,260 20,40 300,40" />
                <polygon className={styles.triPath} points="160,260 300,480 20,480" />
            </svg>

            <div className={styles.btnRegister}>
                {/* type="submit" через form attribute — кнопка вне <form> не нужна */}
                <BaseButtonTrapezoid
                    label={isPending ? 'Отправка…' : 'Регистрация'}
                    variant="filled"
                    disabled={isPending}
                    type="submit"
                />
            </div>

            <input
                className={`${styles.field} ${styles.inputPass}`}
                type={showPass ? 'text' : 'password'}
                placeholder="пароль"
                autoComplete="new-password"
                {...fields.pass.props}
            />
            <button
                type="button"
                className={styles.eyeIcon}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
            >
                {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
            <input
                className={`${styles.field} ${styles.inputConfirm}`}
                type="password"
                placeholder="подтверждение"
                autoComplete="new-password"
                {...fields.confirm.props}
            />
            <input
                className={`${styles.field} ${styles.inputUser}`}
                type="text"
                placeholder="userName"
                autoComplete="username"
                {...fields.user.props}
            />
            <input
                className={`${styles.field} ${styles.inputFirst}`}
                type="text"
                placeholder="firstName"
                autoComplete="given-name"
                {...fields.first.props}
            />
            <input
                className={`${styles.field} ${styles.inputLast}`}
                type="text"
                placeholder="lastName"
                autoComplete="family-name"
                {...fields.last.props}
            />
            <input
                className={`${styles.field} ${styles.inputEmail}`}
                type="email"
                placeholder="email"
                autoComplete="email"
                {...fields.email.props}
            />

            <AuthRoleSwitch role={roleField.value} onChange={(r) => roleField.onChange(r)} />

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
                        placeholder="код ученика"
                        {...fields.teacherCode.props}
                    />
                </div>
            )}

            {(serverError || hasFieldError(fields)) && (
                <div className={styles.errors}>
                    {serverError && <p className={styles.serverError}>{serverError}</p>}
                    {!serverError &&
                        Object.values(fields).map((f) =>
                            f.props.error ? (
                                <p key={f.name} id={`${f.name}-error`} className={styles.fieldError}>
                                    {f.props.error}
                                </p>
                            ) : null,
                        )}
                </div>
            )}
        </form>
    );
}

function hasFieldError(
    fields: Record<string, { props: { error?: string } }>,
): boolean {
    return Object.values(fields).some((f) => Boolean(f.props.error));
}
