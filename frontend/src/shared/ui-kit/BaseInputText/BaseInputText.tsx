import { forwardRef, InputHTMLAttributes } from 'react';
import {BaseInput} from "@/shared/ui-kit/BaseInput/BaseInput.tsx";

interface BaseInputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string;
}

// 1. Оборачиваем в forwardRef
export const BaseInputText = forwardRef<HTMLInputElement, BaseInputTextProps>(
    ({ error, ...props }, ref) => {
        // 2. Пробрасываем ref в BaseInput
        return <BaseInput ref={ref} type="text" error={error} {...props} />;
    }
);

// Полезно для отладки в React DevTools
BaseInputText.displayName = 'BaseInputText';