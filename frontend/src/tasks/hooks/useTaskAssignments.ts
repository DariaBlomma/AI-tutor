import { useEffect, useState, useCallback } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import type { TaskAssignmentDto } from '@/tasks/types';

export interface UseTaskAssignmentsResult {
    /** Список учеников с активными назначениями для задания; null до загрузки. */
    assignments: TaskAssignmentDto[] | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
}

/**
 * Загрузка списка учеников с активными назначениями для задания.
 * Использует GET /api/tasks/{id}/assignments.
 */
export function useTaskAssignments(
    taskId: number | null,
    fetcher: (taskId: number) => Promise<TaskAssignmentDto[]> = TasksBankService.getTaskAssignments,
): UseTaskAssignmentsResult {
    const [assignments, setAssignments] = useState<TaskAssignmentDto[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(() => {
        if (taskId == null) {
            setAssignments(null);
            setIsLoading(false);
            return;
        }
        let active = true;
        setIsLoading(true);
        setIsError(false);
        setError(null);
        fetcher(taskId)
            .then((data) => {
                if (!active) return;
                setAssignments(data);
            })
            .catch((e) => {
                if (!active) return;
                setAssignments([]);
                setIsError(true);
                setError(extractErrorMessage(e as Error));
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => { active = false; };
    }, [taskId, fetcher]);

    useEffect(() => {
        return load() as void;
    }, [taskId, load]);

    return { assignments, isLoading, isError, error };
}
