import { useFormWithValidation } from "@/shared/hooks/useFormWithValidation.ts";
import type { ForgotPasswordFormData } from "@/auth/types";

export function useAuthForgotPasswordFormValidation() {
    const { getFields, isFormInvalid, isFormValidAndTouched, validateForm, form, handleSubmit } =
        useFormWithValidation<ForgotPasswordFormData>({
            initialValues: {
                email: '',
            },
            validationSchema: {
                email: {
                    required: 'Обязательное поле',
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Некорректный email',
                    },
                },
            },
        });

    const fields = getFields();

    return {
        form,
        fields,
        isFormInvalid,
        isFormValidAndTouched,
        validateForm,
        handleSubmit,
    };
}
