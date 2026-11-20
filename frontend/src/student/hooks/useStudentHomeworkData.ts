import { useQuery } from '@tanstack/react-query';
import { StudentDashboardService } from '@/student/services/StudentDashboardService';
import type { HomeworkFilters } from '@/student/services/StudentDashboardService';
import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';

export interface UseStudentHomeworkDataResult {
    works: StudentWorkResponse[];
    totalElements: number;
    totalPages: number;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    reload: () => void;
}

export function useStudentHomeworkData(filters: HomeworkFilters): UseStudentHomeworkDataResult {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['student-homework', filters.page, filters.status, filters.deadlineFrom, filters.deadlineTo, filters.deadlineExcludeFrom, filters.createdAtFrom, filters.datePreset],
        queryFn: () => StudentDashboardService.getWorks(filters),
        staleTime: 0,
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
