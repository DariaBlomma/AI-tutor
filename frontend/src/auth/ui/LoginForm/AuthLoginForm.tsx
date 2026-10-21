import { useState, type FormEvent } from 'react';

import { BaseButtonTrapezoid } from '@/shared/ui-kit/BaseButtonTrapezoid/BaseButtonTrapezoid.tsx';
import { useAuthLoginFormValidation } from '@/auth/hooks/useAuthLoginFormValidation.ts';
import type { LoginFormData } from '@/auth/types/ui';

import styles from './AuthLoginForm.module.scss';

interface AuthLoginFormProps {
    serverError: string | null;
    isPending: boolean;
    onSubmit: (data: LoginFormData) => void;
}

// Каркас страницы входа: два треугольника, поля userName/пароль (как в макете).
export function AuthLoginForm({ serverError, isPending, onSubmit }: AuthLoginFormProps) {
    const { fields, handleSubmit } = useAuthLoginFormValidation();
    const [showPass, setShowPass] = useState(false);

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

            <input
                className={`${styles.field} ${styles.inputUser}`}
                type="text"
                placeholder="userName"
                autoComplete="username"
                {...fields.userName.props}
            />
            <input
                className={`${styles.field} ${styles.inputPass}`}
                type={showPass ? 'text' : 'password'}
                placeholder="пароль"
                autoComplete="current-password"
                {...fields.password.props}
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
