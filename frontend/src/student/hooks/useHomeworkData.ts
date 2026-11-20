import { useQuery } from '@tanstack/react-query';
import { StudentDashboardService } from '@/student/services/StudentDashboardService';
import type { HomeworkFilters } from '@/student/services/StudentDashboardService';
import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';

export interface UseHomeworkDataResult {
    works: StudentWorkResponse[];
    totalElements: number;
    totalPages: number;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    reload: () => void;
}

export function useHomeworkData(filters: HomeworkFilters): UseHomeworkDataResult {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['homework', filters],
        queryFn: () => StudentDashboardService.getWorks(filters),
        staleTime: 30_000,
    });

    return {
        works: data?.content ?? [],
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 0,
        isLoading,
        isError,
        error,
        reload: () => refetch(),
    };
}
