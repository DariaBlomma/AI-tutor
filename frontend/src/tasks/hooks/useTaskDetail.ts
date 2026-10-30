import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import type { TaskResponseDto } from '@/tasks/types';

export interface UseTaskDetailResult {
    /** Полная карточка задания (GET /api/tasks/by-public-id/{publicId}); null до загрузки. */
    task: TaskResponseDto | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    /** Принудительная перезагрузка (например, после мутаций курса/назначения). */
    reload: () => void;
}

/**
 * Загрузка детальной карточки задания по publicId из URL-параметра роута.
 * fetcher внедряется параметром — хук не зависит от транспорта и легко тестируется.
 */
export function useTaskDetail(
    publicId: string,
    fetcher: (publicId: string) => Promise<TaskResponseDto> = TasksBankService.getTaskByPublicId,
): UseTaskDetailResult {
    const [task, setTask] = useState<TaskResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Счётчик перезагрузок: инкремент заставляет effect ниже запросить карточку заново.
    const [reloadToken, setReloadToken] = useState(0);
    const reload = useCallback(() => setReloadToken((t) => t + 1), []);

    useEffect(() => {
        let active = true;

        setIsLoading(true);
        fetcher(publicId)
            .then((data) => {
                if (!active) return;
                setTask(data);
                setIsError(false);
                setError(null);
            })
            .catch((e) => {
                if (!active) return;
                setTask(null);
                setIsError(true);
                setError(extractErrorMessage(e as Error));
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
        // fetcher стабилен по смыслу (метод сервиса) — в deps только данные-зависимости.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicId, reloadToken]);

    return { task, isLoading, isError, error, reload };
}
