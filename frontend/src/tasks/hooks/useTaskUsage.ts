import { useEffect, useState } from 'react';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import type { TaskUsageDto } from '@/tasks/types';

export interface UseTaskUsageResult {
    /** Факт использования задания (GET /api/tasks/by-public-id/{publicId}/usage); null до загрузки. */
    usage: TaskUsageDto | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
}

/**
 * Использование задания учениками — основа для блокировки содержательных полей на странице
 * редактирования: если задание кому-то назначено или уже кем-то решено, текст/пункты/ответы
 * править нельзя (то же проверяет бэк при PUT — 400). Ошибку не считаем блокировкой: поля
 * остаются доступны, а серверная защита не даст сохранить изменённый контент.
 */
export function useTaskUsage(
    publicId: string,
    fetcher: (publicId: string) => Promise<TaskUsageDto> = TasksBankService.getTaskUsage,
): UseTaskUsageResult {
    const [usage, setUsage] = useState<TaskUsageDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        setIsLoading(true);
        setIsError(false);
        setError(null);
        fetcher(publicId)
            .then((data) => {
                if (!active) return;
                setUsage(data);
            })
            .catch((e) => {
                if (!active) return;
                setUsage(null);
                setIsError(true);
                setError(extractErrorMessage(e as Error));
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
        // fetcher стабилен по смыслу (метод сервиса) — в deps только данные-зависимость.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicId]);

    return { usage, isLoading, isError, error };
}
