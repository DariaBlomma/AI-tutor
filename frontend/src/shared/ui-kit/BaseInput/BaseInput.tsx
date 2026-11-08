import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './BaseInput.module.scss';
import {BaseInputVariant} from "@/shared/types";

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    variant?: BaseInputVariant;
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
    ({ className, error, variant = 'minimal', ...props }, ref) => {
        return (
            <div className={`${styles.wrapper} ${className || ''} ${error ? styles.hasError : ''}`}>
                <input
                    ref={ref}
                    className={`${styles.input} ${variant === 'full' ? styles.inputFull : ''}`}
                    {...props}
                />
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);
BaseInput.displayName = 'BaseInput';