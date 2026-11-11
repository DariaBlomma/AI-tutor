import { useQuery } from '@tanstack/react-query';
import { TasksBankService } from '@/tasks/services/TasksBankService';
import { extractErrorMessage } from '@/core/api/utils/errors';
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
 * Использует TanStack Query — кэш отсутствует (staleTime: 0), перезапрос на каждый mount/reload.
 */
export function useTaskDetail(publicId: string): UseTaskDetailResult {
    const query = useQuery({
        queryKey: ['task', publicId],
        queryFn: () => TasksBankService.getTaskByPublicId(publicId),
        staleTime: 0,
        retry: false,
    });

    return {
        task: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error ? extractErrorMessage(query.error) : null,
        reload: query.refetch,
    };
}
