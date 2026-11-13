import { forwardRef, InputHTMLAttributes } from 'react';
import { BaseInput } from '@/shared/ui-kit/BaseInput/BaseInput.tsx';
import { BaseInputVariant } from '@/shared/types';
import { FormFieldLabel } from '@/shared/ui-kit/FormFieldLabel/FormFieldLabel';

interface BaseInputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string;
    variant?: BaseInputVariant;
    /** Видимый лейбл над полем. */
    label?: string;
    /** Показывать красную звёздочку перед лейблом. */
    isRequired?: boolean;
}

// 1. Оборачиваем в forwardRef
export const BaseInputText = forwardRef<HTMLInputElement, BaseInputTextProps>(
    ({ error, variant, label, isRequired, ...props }, ref) => {
        return (
            <>
                <FormFieldLabel label={label} isRequired={isRequired} />
                <BaseInput ref={ref} type="text" error={error} variant={variant || 'minimal'} {...props} />
            </>
        );
    },
);

// Полезно для отладки в React DevTools
BaseInputText.displayName = 'BaseInputText';
