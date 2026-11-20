import { useState, useCallback, useMemo } from 'react';
import type { WorkStatus } from '@/student/types/work';
import type { DatePreset, DateRange } from '@/student/lib/datePresets';
import { getDateRange } from '@/student/lib/datePresets';
import type { HomeworkFilters } from '@/student/services/StudentDashboardService';

export type StatusFilter = 'all' | WorkStatus;

export interface UseStudentHomeworkFiltersResult {
    // Статус-фильтр
    statusFilter: StatusFilter;
    setStatusFilter: (status: StatusFilter) => void;

    // Дата-пресет
    datePreset: DatePreset;
    setDatePreset: (preset: DatePreset) => void;

    // Дата-диапазон (custom)
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;

    // Пагинация
    page: number;
    setPage: (page: number) => void;

    // Итоговые параметры для API
    apiParams: HomeworkFilters;

    // Сброс
    resetFilters: () => void;
}

const PAGE_SIZE = 10;

export function useStudentHomeworkFilters(): UseStudentHomeworkFiltersResult {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [datePreset, setDatePreset] = useState<DatePreset>('all');
    const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
    const [page, setPage] = useState(0);

    // При смене пресета автоматически обновляем dateRange
    const handleDatePresetChange = useCallback((preset: DatePreset) => {
        setDatePreset(preset);
        if (preset !== 'custom') {
            setDateRange(getDateRange(preset));
        }
    }, []);

    const resetFilters = useCallback(() => {
        setStatusFilter('all');
        setDatePreset('all');
        setDateRange({ from: null, to: null });
        setPage(0);
    }, []);

    // Собираем параметры для API
    const apiParams = useMemo<HomeworkFilters>(() => {
        // Определяем deadlineFrom и deadlineTo
        let deadlineFrom: string | null = null;
        let deadlineTo: string | null = null;

        if (datePreset === 'custom') {
            deadlineFrom = dateRange.from;
            deadlineTo = dateRange.to;
        } else {
            const range = getDateRange(datePreset);
            deadlineFrom = range.from;
            deadlineTo = range.to;
        }

        return {
            page,
            size: PAGE_SIZE,
            sortBy: 'createdAt',
            sortDirection: 'desc',
            deadlineFrom,
            deadlineTo,
        };
    }, [page, datePreset, dateRange]);

    return {
        statusFilter,
        setStatusFilter,
        datePreset,
        setDatePreset: handleDatePresetChange,
        dateRange,
        setDateRange,
        page,
        setPage,
        apiParams,
        resetFilters,
    };
}
