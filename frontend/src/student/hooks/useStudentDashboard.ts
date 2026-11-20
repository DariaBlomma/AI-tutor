import { useStudentDashboardData } from '@/student/hooks/useStudentDashboardData';
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

/**
 * Хук для отображения дашборда.
 * Использует useStudentDashboardData для загрузки данных с серверной фильтрацией,
 * затем выполняет клиентскую фильтрацию и сортировку для каждого блока.
 */
export function useStudentDashboard(): UseStudentDashboardResult {
    const { block1: rawBlock1, block2: rawBlock2, isLoading, isError, error, refetch } = useStudentDashboardData();

    const block1 = useMemo(
        () => rawBlock1.map(mapToStudentWorkCard),
        [rawBlock1],
    );

    const block2 = useMemo(
        () => rawBlock2.map(mapToStudentWorkCard),
        [rawBlock2],
    );

    return { block1, block2, isLoading, isError, error, refetch };
}
