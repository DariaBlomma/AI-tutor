import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { TeacherStudentsService } from '@/teacher/services/TeacherStudentsService';
import type { AssignmentResult, StudentBrief } from '@/teacher/types';

export interface UseAssignTaskToStudentsResult {
    students: StudentBrief[];
    isLoadingStudents: boolean;
    isAssigning: boolean;
    /** Текст последней ошибки (загрузка списка / назначение) или null. */
    error: string | null;
    /** Итог последнего успешного назначения (для сообщения «создано N, пропущено дублей M»). */
    lastResult: AssignmentResult | null;
    /** Отправить POST /api/teacher/assignments; возвращает текст ошибки или null при успехе. */
    assign: (taskIds: number[], studentIds: number[], deadline: string | null) => Promise<string | null>;
}

// Минимальная валидация формы назначения (зеркалит @NotEmpty бэка + страховку от дедлайна в прошлом).
export function validateAssignment(studentIds: number[], deadlineValue: string): string | null {
    if (!studentIds.length) return 'Выберите хотя бы одного ученика.';
    if (deadlineValue && new Date(deadlineValue).getTime() <= Date.now()) {
        return 'Дедлайн должен быть в будущем.';
    }
    return null;
}

/**
 * Назначение задания ученикам: список своих учеников (ленивая загрузка при открытии попапа)
 * + отправка AssignTasksRequest (deadline — ISO-8601 UTC из datetime-local или null).
 */
export function useAssignTaskToStudents(enabled: boolean): UseAssignTaskToStudentsResult {
    const [students, setStudents] = useState<StudentBrief[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<AssignmentResult | null>(null);

    useEffect(() => {
        if (!enabled) return;
        let active = true;

        setIsLoadingStudents(true);
        TeacherStudentsService.getMyStudents()
            .then((data) => {
                if (!active) return;
                setStudents(data);
                setError(null);
            })
            .catch((e) => {
                if (!active) return;
                setError(extractErrorMessage(e as Error));
            })
            .finally(() => {
                if (active) setIsLoadingStudents(false);
            });

        return () => {
            active = false;
        };
    }, [enabled]);

    const assign = useCallback(async (taskIds: number[], studentIds: number[], deadline: string | null) => {
        const validationError = validateAssignment(studentIds, deadline ?? '');
        if (validationError) {
            setError(validationError);
            return validationError;
        }
        setIsAssigning(true);
        try {
            const result = await TeacherStudentsService.assignTasks({
                studentIds,
                taskIds,
                // datetime-local -> Instant (бэк принимает ISO-8601 UTC).
                deadline: deadline ? new Date(deadline).toISOString() : null,
            });
            setLastResult(result);
            setError(null);
            return null;
        } catch (e) {
            const message = extractErrorMessage(e as Error);
            setError(message);
            return message;
        } finally {
            setIsAssigning(false);
        }
    }, []);

    return { students, isLoadingStudents, isAssigning, error, lastResult, assign };
}
