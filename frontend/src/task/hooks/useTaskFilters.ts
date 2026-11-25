import { useState, useCallback, useMemo } from 'react';
import type { WorkStatus } from '@/student/types/work';
import type { FilterChipType, DatePreset, DateRange } from '@/task/types/ui';
import { getDateRange } from '@/student/utils/datePresets.ts';
import { UI_STATUS_TO_BACKEND } from '@/task/types/ui';

/** Параметры фильтрации для API. */
export interface TaskApiFilters {
    page: number;
    size: number;
    sortBy?: 'deadline' | 'status' | 'createdAt';
    sortDirection?: 'asc' | 'desc';
    status?: WorkStatus;
    deadlineFrom?: string | null;
    deadlineTo?: string | null;
    deadlineExcludeFrom?: string | null;
    createdAtFrom?: string | null;
    completedAtFrom?: string | null;
    completedAtTo?: string | null;
    datePreset?: DatePreset;
}

/** Результат хука. */
export interface UseTaskFiltersResult {
    statusFilter: FilterChipType;
    setStatusFilter: (status: FilterChipType) => void;
    datePreset: DatePreset;
    setDatePreset: (preset: DatePreset) => void;
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
    page: number;
    setPage: (page: number) => void;
    apiParams: TaskApiFilters;
    resetFilters: () => void;
}

/**
 * Хук управления фильтрами задач для страницы homework.
 * Возвращает состояние фильтров и готовые параметры для API.
 */
export function useTaskFilters(pageSize: number = 10): UseTaskFiltersResult {
    const [statusFilter, setStatusFilter] = useState<FilterChipType>('all');
    const [datePreset, setDatePresetState] = useState<DatePreset>('all');
    const [dateRange, setDateRangeState] = useState<DateRange>({ from: null, to: null });
    const [page, setPage] = useState(0);

    const setDatePreset = useCallback((preset: DatePreset) => {
        setDatePresetState(preset);
        if (preset !== 'custom') {
            setDateRangeState(getDateRange(preset));
        }
    }, []);

    const resetFilters = useCallback(() => {
        setStatusFilter('all');
        setDatePreset('all');
        setDateRangeState({ from: null, to: null });
        setPage(0);
    }, [setDatePreset]);

    const apiParams = useMemo<TaskApiFilters>(() => {
        const range = getDateRange(datePreset);
        const fallbackFrom = range.from;
        const fallbackTo = range.to;

        const statusParams = statusFilter !== 'all'
            ? UI_STATUS_TO_BACKEND[statusFilter]
            : {};

        // Для COMPLETED — фильтруем по completedAt из datePreset/dateRange,
        // для остальных — по deadline из UI_STATUS_TO_BACKEND
        const isCompleted = statusParams.status === 'COMPLETED';
        const deadlineFrom = isCompleted ? undefined : (statusParams.deadlineFrom?.() ?? fallbackFrom);
        const deadlineTo = isCompleted ? undefined : (statusParams.deadlineTo?.() ?? fallbackTo);

        return {
            page,
            size: pageSize,
            sortBy: 'createdAt',
            sortDirection: 'desc',
            status: statusParams.status,
            deadlineFrom,
            deadlineTo,
            deadlineExcludeFrom: statusParams.deadlineExcludeFrom?.(),
            createdAtFrom: statusParams.createdAtFrom?.(),
            completedAtFrom: isCompleted ? fallbackFrom : statusParams.completedAtFrom?.(),
            completedAtTo: isCompleted ? fallbackTo : statusParams.completedAtTo?.(),
            datePreset,
        };
    }, [page, statusFilter, datePreset, pageSize]);

    return {
        statusFilter,
        setStatusFilter,
        datePreset,
        setDatePreset,
        dateRange,
        setDateRange: setDateRangeState,
        page,
        setPage,
        apiParams,
        resetFilters,
    };
}
