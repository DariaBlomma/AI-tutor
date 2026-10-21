import { useState, type FormEvent } from 'react';

import { BaseButtonTrapezoid } from '@/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { useAuthResetPasswordFormValidation } from '@/auth/hooks/useAuthResetPasswordFormValidation.ts';
import type { ResetPasswordFormData } from '@/auth/types/ui';

import styles from './AuthResetPasswordForm.module.scss';

interface AuthResetPasswordFormProps {
    serverError: string | null;
    isPending: boolean;
    onSubmit: (data: ResetPasswordFormData) => void;
}

// Каркас страницы сброса пароля: два треугольника, поля нового пароля
// и подтверждения (верстка по аналогии со страницей входа).
export function AuthResetPasswordForm({ serverError, isPending, onSubmit }: AuthResetPasswordFormProps) {
    const { fields, handleSubmit } = useAuthResetPasswordFormValidation();
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const onFormSubmit = handleSubmit((data) => onSubmit(data));

    return (
        <form className={styles.wrap} onSubmit={(e: FormEvent) => void onFormSubmit(e)}>
            <svg className={styles.triSvg} viewBox="0 0 320 520">
                <polygon className={styles.triPath} points="160,260 20,40 300,40" />
                <polygon className={styles.triPath} points="160,260 300,480 20,480" />
            </svg>

            <div className={styles.btnSubmit}>
                <BaseButtonTrapezoid
                    label={isPending ? 'Отправка…' : 'Сохранить'}
                    variant="filled"
                    disabled={isPending}
                    type="submit"
                />
            </div>

            <input
                className={`${styles.field} ${styles.inputPass}`}
                type={showPass ? 'text' : 'password'}
                placeholder="новый пароль"
                autoComplete="new-password"
                {...fields.pass.props}
            />
            <button
                type="button"
                className={styles.eyeIcon}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
            >
                <EyeIcon visible={showPass} />
            </button>

            <input
                className={`${styles.field} ${styles.inputConfirm}`}
                type={showConfirm ? 'text' : 'password'}
                placeholder="подтверждение"
                autoComplete="new-password"
                {...fields.confirm.props}
            />
            <button
                type="button"
                className={`${styles.eyeIcon} ${styles.eyeIconConfirm}`}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
            >
                <EyeIcon visible={showConfirm} />
            </button>

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

function EyeIcon({ visible }: { visible: boolean }) {
    return visible ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function hasFieldError(
    fields: Record<string, { props: { error?: string } }>,
): boolean {
    return Object.values(fields).some((f) => Boolean(f.props.error));
}
