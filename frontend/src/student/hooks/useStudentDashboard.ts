import { useQuery } from '@tanstack/react-query';
import { StudentDashboardService } from '@/student/services/StudentDashboardService';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { mapToDashboardAssignment, computeMonthlyStats } from '@/student/lib/dashboardUtils';
import type { MonthlyStats, DashboardAssignment } from '@/student/types/models/dashboard';

export interface UseStudentDashboardResult {
    stats: MonthlyStats | null;
    assignments: DashboardAssignment[];
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    refetch: () => void;
}

export function useStudentDashboard(): UseStudentDashboardResult {
    const query = useQuery({
        queryKey: ['student', 'dashboard'],
        queryFn: () => StudentDashboardService.getWorks(0, 100),
    });

    if (query.isLoading) {
        return { stats: null, assignments: [], isLoading: true, isError: false, error: null, refetch: query.refetch };
    }

    if (query.isError) {
        return {
            stats: null, assignments: [], isLoading: false, isError: true,
            error: extractErrorMessage(query.error), refetch: query.refetch,
        };
    }

    const works = query.data?.content ?? [];
    const assignments = works.map(mapToDashboardAssignment);
    const stats = computeMonthlyStats(assignments);

    return { stats, assignments, isLoading: false, isError: false, error: null, refetch: query.refetch };
}
