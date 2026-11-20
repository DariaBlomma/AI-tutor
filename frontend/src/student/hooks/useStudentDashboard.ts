import { useQueries } from '@tanstack/react-query';
import { StudentDashboardService } from '@/student/services/StudentDashboardService';
import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';
import { extractErrorMessage } from '@/core/api/utils/errors';
import { mapToStudentWorkCard } from '@/student/lib/dashboardUtils';
import type { StudentWorkCard } from '@/student/types/models/studentWorkCard';
import { useMemo } from 'react';

/** Результат хука useStudentDashboard — два отфильтрованных блока. */
export interface UseStudentDashboardResult {
    block1: StudentWorkCard[]; // «Нужно сделать» — HIGH priority
    block2: StudentWorkCard[]; // «Новые задания» — LOW priority
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    refetch: () => void;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function useStudentDashboard(): UseStudentDashboardResult {
    const [worksQuery] = useQueries({
        queries: [
            {
                queryKey: ['student', 'dashboard'],
                queryFn: () => StudentDashboardService.getWorks({ page: 0, size: 100 }),
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
        ],
    });

    const isLoading = worksQuery.isLoading;
    const isError = worksQuery.isError;
    const error = worksQuery.error != null
        ? extractErrorMessage(worksQuery.error)
        : null;

    const assignments = useMemo(
        () => ((worksQuery.data as { content: StudentWorkResponse[] } | undefined)?.content ?? []).map(mapToStudentWorkCard),
        [worksQuery.data],
    );

    if (isLoading) {
        return { block1: [], block2: [], isLoading: true, isError: false, error: null, refetch: () => worksQuery.refetch() };
    }

    if (isError) {
        return {
            block1: [], block2: [], isLoading: false, isError: true,
            error, refetch: () => worksQuery.refetch(),
        };
    }

    const now = Date.now();
    const fourteenDaysMs = 14 * MS_PER_DAY;

    // Block 1: «Нужно сделать» — HIGH priority
    // status = ASSIGNED или IN_PROGRESS, deadline от сегодня до +14 дней
    const block1 = assignments
        .filter((a: StudentWorkCard) => {
            if (a.status !== 'ASSIGNED' && a.status !== 'IN_PROGRESS') return false;
            if (!a.deadline) return false;
            const dl = new Date(a.deadline).getTime();
            return dl >= now && dl <= now + fourteenDaysMs;
        })
        .sort((a: StudentWorkCard, b: StudentWorkCard) => {
            if (!a.deadline || !b.deadline) return 0;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });

    // Block 2: «Новые задания» — LOW priority
    // status = ASSIGNED (не начато), createdAt ≤ 14 дней назад,
    // deadline > 14 дней (если указан), или дедлайна нет
    const block2 = assignments
        .filter((a: StudentWorkCard) => {
            if (a.status !== 'ASSIGNED') return false;
            if (!a.createdAt) return false;
            const created = new Date(a.createdAt).getTime();
            // createdAt within last 14 days
            if (created < now - fourteenDaysMs) return false;
            // deadline > 14 дней (если указан), или дедлайна нет
            if (a.deadline && new Date(a.deadline).getTime() <= now + fourteenDaysMs) return false;
            return true;
        })
        .sort((a: StudentWorkCard, b: StudentWorkCard) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return { block1, block2, isLoading: false, isError: false, error, refetch: () => worksQuery.refetch() };
}
