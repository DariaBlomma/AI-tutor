import { useCallback, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import { buildTaskPayload } from '@/tasks/lib/buildTaskPayload';
import { isFormValid, validateTaskForm } from '@/tasks/lib/validateTaskForm';
import type { MaterialFormat, TaskItemDraft } from '@/tasks/types';

export interface CreateTaskFormState {
    name: string;
    topicIds: number[];
    grammarTypeIds: number[];
    materialFormat: MaterialFormat;
    materialTitle: string;
    materialText: string;
    items: TaskItemDraft[];
}

interface UseCreateTaskResult {
    submit: (form: CreateTaskFormState) => Promise<boolean>;
    isSubmitting: boolean;
    /** Сообщение об ошибке (локальная валидация или ответ бэка). */
    error: string | null;
}

// Отправка POST /api/tasks: сначала локальная валидация (зеркалит бэка),
// затем запрос; текст 400 от TaskContentValidator показываем как есть.
export function useCreateTask(onSuccess: () => void): UseCreateTaskResult {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(
        async (form: CreateTaskFormState): Promise<boolean> => {
            const errors = validateTaskForm(form);
            if (!isFormValid(errors, form.grammarTypeIds.length > 0)) {
                setError('Проверьте выделенные поля — форма заполнена не полностью.');
                return false;
            }

            try {
                setIsSubmitting(true);
                setError(null);
                await TasksBankService.createTask(buildTaskPayload(form));
                onSuccess();
                return true;
            } catch (e) {
                setError(extractErrorMessage(e as Error));
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [onSuccess],
    );

    return { submit, isSubmitting, error };
}
