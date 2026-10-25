import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './BaseInput.module.scss';

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className={`${styles.wrapper} ${className || ''} ${error ? styles.hasError : ''}`}>
                <input
                    ref={ref}
                    className={styles.input}
                    {...props}
                />
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    }
);
BaseInput.displayName = 'BaseInput';