import {
    useForm, type FieldValues, type Path, type RegisterOptions,
    type DefaultValues
} from 'react-hook-form';
import { useState} from 'react';


type ValidationSchema<T extends FieldValues> = {
    [K in keyof T]?: RegisterOptions<T, Path<T>>;
};

interface UseFormWithValidationOptions<T extends FieldValues> {
    initialValues: T;
    validationSchema?: ValidationSchema<T>;
}

export function useFormWithValidation<T extends FieldValues>(
    options: UseFormWithValidationOptions<T>
) {
    const { initialValues, validationSchema } = options;

    const form = useForm<T>({
        defaultValues: initialValues as DefaultValues<T>,
        mode: 'onTouched',
    });

    const { errors, touchedFields, isValid } = form.formState;
    const [submitted, setSubmitted] = useState(false);

    const getField = <K extends Path<T>>(name: K) => {
        const rules = validationSchema?.[name] as RegisterOptions<T, K> | undefined;
        const fieldError = errors[name]?.message as string | undefined;
        // @ts-expect-error deep touched lookup by generic Path<T> is not expressible in types
        const isFieldTouched = touchedFields[name];
        const error = (isFieldTouched || submitted) ? fieldError : undefined;

        const props = {
            ...form.register(name, rules),
            'aria-invalid': !!error,
            'aria-describedby': error ? `${name}-error` : undefined,
            error,
        };

        return {
            name,
            props,
        };
    };

    const getFields = () => {
        const keys = Object.keys(initialValues) as Path<T>[];
        return Object.fromEntries(
            keys.map((key) => [key, getField(key)])
        ) as Record<Path<T>, ReturnType<typeof getField<Path<T>>>>;
    };

    const validateForm = async () => {
        setSubmitted(true);
        return await form.trigger();
    };

    const resetForm = (data: T) => {
        setSubmitted(false);
        form.reset(data, {  keepDefaultValues: true,
            keepDirty: false,
            keepTouched: false,
            keepValues: false }
        );
    };

    const isTouched = Object.keys(touchedFields).length > 0;
    const isFormValidAndTouched = (isTouched || submitted) && isValid && Object.keys(errors).length === 0;
    const isFormInvalid = !isValid && Object.keys(errors).length > 0;

    return {
        form,
        getField,
        getFields,
        validateForm,
        resetForm,
        isFormValidAndTouched,
        isFormInvalid,
        isTouched,
        errors,
        handleSubmit: form.handleSubmit,
        watch: form.watch,
        control: form.control,
    };
}
