import { useState, useCallback, useMemo } from 'react';
import type {FilterChipType, DatePreset, DateRange, UseTaskFiltersResult} from '@/task/types/ui';
import { getDateRange } from '@/student/utils/datePresets.ts';
import { UI_STATUS_TO_BACKEND, UITaskStatus } from '@/task/types/ui';
import {TaskApiFilters} from "@/task/types";

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
        const baseParams: TaskApiFilters = {
            page,
            size: pageSize,
            sortBy: 'createdAt',
            sortDirection: 'desc',
        };

        if (statusFilter === 'all') {
            return baseParams;
        }

        const mapping = UI_STATUS_TO_BACKEND[statusFilter];
        const params: TaskApiFilters = { ...baseParams, status: mapping.status };

        // Пользовательская дата применяется ТОЛЬКО для completed и overdue
        const useUserDate = statusFilter === UITaskStatus.COMPLETED || statusFilter === UITaskStatus.OVERDUE;

        // КРИТИЧНЫЙ ФИКС: используем dateRange, если выбран custom
        const userRange = datePreset === 'custom' ? dateRange : getDateRange(datePreset);

        if (useUserDate) {
            if (statusFilter === UITaskStatus.COMPLETED) {
                params.completedAtFrom = userRange.from;
                params.completedAtTo = userRange.to;
            } else { // OVERDUE
                params.deadlineFrom = userRange.from;
                params.deadlineTo = userRange.to;
            }
        } else {
            // Для остальных статусов (new, urgent, in-progress) берем даты строго из маппинга
            if (mapping.deadlineFrom) params.deadlineFrom = mapping.deadlineFrom();
            if (mapping.deadlineTo) params.deadlineTo = mapping.deadlineTo();
            if (mapping.createdAtFrom) params.createdAtFrom = mapping.createdAtFrom();
            if (mapping.deadlineExcludeFrom) params.deadlineExcludeFrom = mapping.deadlineExcludeFrom();
            if (mapping.completedAtFrom) params.completedAtFrom = mapping.completedAtFrom();
            if (mapping.completedAtTo) params.completedAtTo = mapping.completedAtTo();
        }

        return params;
    }, [page, statusFilter, datePreset, dateRange, pageSize]); // <-- dateRange добавлен в зависимости

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