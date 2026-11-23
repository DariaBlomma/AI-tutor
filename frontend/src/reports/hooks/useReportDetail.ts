import { useQuery } from '@tanstack/react-query';
import type { WorkReportDetailDto } from '@/reports/types';

export function useReportDetail(
    workId: number | string,
    fetcher: () => Promise<WorkReportDetailDto>
) {
    return useQuery({
        // Уникальный ключ кэша. Для учителя можно добавить studentId в ключ, если нужно
        queryKey: ['work-report', String(workId)],
        queryFn: fetcher, // <-- Используем переданную функцию!

        // ГЛАВНОЕ ИСПРАВЛЕНИЕ: Лечим 409 Conflict
        retry: (failureCount, error: any) => {
            if (error?.status === 409 && failureCount < 3) {
                console.warn(`Отчет еще не готов (409), повторная попытка ${failureCount + 1}...`);
                return true;
            }
            return false;
        },
        retryDelay: 600, // Ждем 600мс между попытками

        enabled: !!workId, // Не делаем запрос, если ID еще нет
    });
}