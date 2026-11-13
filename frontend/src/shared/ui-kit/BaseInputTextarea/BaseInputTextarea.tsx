import { forwardRef, TextareaHTMLAttributes } from 'react';
import { FormFieldLabel } from '@/shared/ui-kit/FormFieldLabel/FormFieldLabel';
import styles from './BaseInputTextarea.module.scss';

interface BaseInputTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    /** Видимый лейбл над полем. */
    label?: string;
    /** Показывать красную звёздочку перед лейблом. */
    isRequired?: boolean;
}

export const BaseInputTextarea = forwardRef<HTMLTextAreaElement, BaseInputTextareaProps>(
    ({ error, label, isRequired, ...props }, ref) => {
        return (
            <div className={styles.wrapper}>
                <FormFieldLabel label={label} isRequired={isRequired} />
                <textarea
                    ref={ref}
                    className={styles.textarea}
                    {...props}
                />
                {error && <span className={styles.errorMessage}>{error}</span>}
            </div>
        );
    },
);

BaseInputTextarea.displayName = 'BaseInputTextarea';
