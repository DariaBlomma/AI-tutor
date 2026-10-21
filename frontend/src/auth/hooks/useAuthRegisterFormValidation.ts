import { useFormWithValidation } from "@/shared/hooks/useFormWithValidation.ts";
import type { RegisterFormData } from "@/auth/types";

export function useAuthRegisterFormValidation() {
    const { getFields, isFormInvalid, isFormValidAndTouched, validateForm, form, handleSubmit, watch } =
        useFormWithValidation<RegisterFormData>({
            initialValues: {
                pass: '',
                confirm: '',
                user: '',
                first: '',
                last: '',
                email: '',
                teacherCode: '',
                role: 'TEACHER',
            },
            validationSchema: {
                pass: {
                    required: 'Обязательное поле',
                    minLength: { value: 6, message: 'Минимум 6 символов' },
                    maxLength: { value: 64, message: 'Максимум 64 символа' },
                },
                confirm: {
                    required: 'Обязательное поле',
                    validate: (value, values) =>
                        value === values.pass || 'Пароли не совпадают',
                },
                user: {
                    required: 'Обязательное поле',
                    minLength: { value: 3, message: 'Минимум 3 символа' },
                    maxLength: { value: 20, message: 'Максимум 20 символов' },
                },
                first: {
                    required: 'Обязательное поле',
                    maxLength: { value: 50, message: 'Максимум 50 символов' },
                },
                last: {
                    required: 'Обязательное поле',
                    maxLength: { value: 50, message: 'Максимум 50 символов' },
                },
                email: {
                    required: 'Обязательное поле',
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Некорректный формат email',
                    },
                },
                teacherCode: {
                    validate: (value, values) =>
                        values.role !== 'STUDENT' || value.trim().length > 0
                            ? true
                            : 'Ученик обязан указать код учителя',
                },
            },
        });

    const fields = getFields();

    return {
        form,
        fields,
        watch,
        isFormInvalid,
        isFormValidAndTouched,
        validateForm,
        handleSubmit,
    };
}
