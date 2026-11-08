import { forwardRef, InputHTMLAttributes } from 'react';
import {BaseInput} from "@/shared/ui-kit/BaseInput/BaseInput.tsx";
import {BaseInputVariant} from "@/shared/types";

interface BaseInputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string;
    variant?: BaseInputVariant;
}

// 1. Оборачиваем в forwardRef
export const BaseInputText = forwardRef<HTMLInputElement, BaseInputTextProps>(
    ({ error, variant, ...props }, ref) => {
        // 2. Пробрасываем ref в BaseInput
        return <BaseInput ref={ref} type="text" error={error} variant={variant || "minimal"} {...props} />;
    }
);

// Полезно для отладки в React DevTools
BaseInputText.displayName = 'BaseInputText';