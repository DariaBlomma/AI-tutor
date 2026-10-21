import { useFormWithValidation } from "@/shared/hooks/useFormWithValidation.ts";
import type { LoginFormData } from "@/auth/types";

export function useAuthLoginFormValidation() {
    const { getFields, isFormInvalid, isFormValidAndTouched, validateForm, form, handleSubmit } =
        useFormWithValidation<LoginFormData>({
            initialValues: {
                userName: '',
                password: '',
            },
            validationSchema: {
                userName: {
                    required: 'Обязательное поле',
                    minLength: { value: 3, message: 'Минимум 3 символа' },
                    maxLength: { value: 20, message: 'Максимум 20 символов' },
                },
                password: {
                    required: 'Обязательное поле',
                    minLength: { value: 6, message: 'Минимум 6 символов' },
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
