import { useState, forwardRef, InputHTMLAttributes } from 'react';
import styles from './BaseInputPassword.module.scss';
import {BaseInput} from "@/shared/ui-kit/BaseInput/BaseInput.tsx";

interface BaseInputPasswordProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string;
}

export const BaseInputPassword = forwardRef<HTMLInputElement, BaseInputPasswordProps>(
    ({ error, className, ...props }, ref) => {
        const [showPass, setShowPass] = useState(false);

        return (
            <div className={`${styles.passwordWrapper} ${className || ''} ${error ? styles.hasError : ''}`}>
                {/* Обертка для инпута и иконки глаза */}
                <div className={styles.inputContainer}>
                    <BaseInput
                        ref={ref}
                        type={showPass ? 'text' : 'password'}
                        error={error}
                        className={styles.inputWithIcon}
                        {...props}
                    />
                    <button
                        type="button"
                        className={styles.eyeIcon}
                        onClick={() => setShowPass((v) => !v)}
                        aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                        tabIndex={-1}
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
                </div>
            </div>
        );
    }
);

BaseInputPassword.displayName = 'BaseInputPassword';