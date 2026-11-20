import { useState, useCallback, useMemo } from 'react';
import type { WorkStatus } from '@/student/types/work';
import type { FilterChipType, DatePreset, DateRange, BackendFilterParams } from '@/tasks/types/ui';
import { getDateRange } from '@/student/lib/datePresets';
import { UI_STATUS_TO_BACKEND, UITaskStatus } from '@/tasks/types/ui';

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

        // Если статус не задаёт deadline — используем datePreset
        const deadlineFrom = statusParams.deadlineFrom?.() ?? fallbackFrom;
        const deadlineTo = statusParams.deadlineTo?.() ?? fallbackTo;

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
