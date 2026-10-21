import { useFormWithValidation } from "@/shared/hooks/useFormWithValidation.ts";
import type { ResetPasswordFormData } from "@/auth/types";

export function useAuthResetPasswordFormValidation() {
    const { getFields, isFormInvalid, isFormValidAndTouched, validateForm, form, handleSubmit } =
        useFormWithValidation<ResetPasswordFormData>({
            initialValues: {
                pass: '',
                confirm: '',
            },
            validationSchema: {
                pass: {
                    required: 'Обязательное поле',
                    minLength: { value: 6, message: 'Минимум 6 символов' },
                },
                confirm: {
                    required: 'Обязательное поле',
                    validate: (value, values) =>
                        value === values.pass || 'Пароли не совпадают',
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
