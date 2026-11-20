import { useQueries } from '@tanstack/react-query';
import { StudentDashboardService } from '@/student/services/StudentDashboardService';
import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';
import { extractErrorMessage } from '@/core/api/utils/errors';

/** Результат хука useStudentDashboardData — два блока с данными. */
export interface UseStudentDashboardDataResult {
    block1: StudentWorkResponse[]; // «Нужно сделать» — HIGH priority
    block2: StudentWorkResponse[]; // «Новые задания» — LOW priority
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    refetch: () => void;
}

const PAGE_SIZE = 10;

/**
 * Хук для загрузки данных дашборда с серверной пагинацией.
 * Делает два параллельных запроса — по PAGE_SIZE элементов для каждого блока.
 * Фильтрация выполняется на бэкенде.
 */
export function useStudentDashboardData(): UseStudentDashboardDataResult {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const deadlineTo = new Date(todayStart);
    deadlineTo.setDate(deadlineTo.getDate() + 14);
    const createdAtFrom = new Date(todayStart);
    createdAtFrom.setDate(createdAtFrom.getDate() - 14);

    const [block1Query, block2Query] = useQueries({
        queries: [
            // Block 1: «Нужно сделать» — status=ASSIGNED|IN_PROGRESS, deadline от сегодня до +14 дней
            {
                queryKey: ['student', 'dashboard', 'block1'],
                queryFn: () => StudentDashboardService.getWorks({
                    page: 0,
                    size: PAGE_SIZE,
                    sortBy: 'deadline',
                    sortDirection: 'asc',
                    status: 'ASSIGNED',
                    deadlineFrom: todayStart.toISOString(),
                    deadlineTo: deadlineTo.toISOString(),
                }),
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
            // Block 2: «Новые задания» — status=ASSIGNED, создано ≤ 14 дней назад, deadline > 14 дней
            {
                queryKey: ['student', 'dashboard', 'block2'],
                queryFn: () => StudentDashboardService.getWorks({
                    page: 0,
                    size: PAGE_SIZE,
                    sortBy: 'createdAt',
                    sortDirection: 'desc',
                    status: 'ASSIGNED',
                    createdAtFrom: createdAtFrom.toISOString(),
                    deadlineExcludeFrom: deadlineTo.toISOString(),
                }),
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
        ],
    });

    const isLoading = block1Query.isLoading || block2Query.isLoading;
    const isError = block1Query.isError || block2Query.isError;
    const error = block1Query.error != null
        ? extractErrorMessage(block1Query.error)
        : block2Query.error != null
            ? extractErrorMessage(block2Query.error)
            : null;

    const block1 = (block1Query.data?.content ?? []);
    const block2 = (block2Query.data?.content ?? []);

    return {
        block1,
        block2,
        isLoading,
        isError,
        error,
        refetch: () => {
            block1Query.refetch();
            block2Query.refetch();
        },
    };
}
