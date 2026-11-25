import { useMemo } from 'react';
import type { WorkStatus } from '@/student/types/work';
import type { StatusFilter, DatePreset, DateRange } from '@/student/hooks/useHomeworkFilters';
import { PRESET_LABELS } from '@/student/utils/datePresets.ts';
import { DateTimePicker } from '@/shared/ui-kit/DateTimePicker/DateTimePicker';
import styles from './HomeworkFilters.module.scss';

export interface HomeworkFiltersProps {
    statusFilter: StatusFilter;
    onStatusChange: (status: StatusFilter) => void;
    datePreset: DatePreset;
    onDatePresetChange: (preset: DatePreset) => void;
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'ASSIGNED', label: 'Новое' },
    { value: 'IN_PROGRESS', label: 'В процессе' },
    { value: 'COMPLETED', label: 'Выполнено' },
    { value: 'EXPIRED', label: 'Просрочено' },
];

export function HomeworkFilters({
    statusFilter,
    onStatusChange,
    datePreset,
    onDatePresetChange,
    dateRange,
    onDateRangeChange,
}: HomeworkFiltersProps) {
    const isCustom = datePreset === 'custom';

    const handleDateFromChange = useMemo(() => (value: string) => {
        onDateRangeChange({ ...dateRange, from: value });
    }, [dateRange, onDateRangeChange]);

    const handleDateToChange = useMemo(() => (value: string) => {
        onDateRangeChange({ ...dateRange, to: value });
    }, [dateRange, onDateRangeChange]);

    return (
        <div className={styles.filters}>
            {/* Фильтр по статусу */}
            <div className={styles.statusChips}>
                {STATUS_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        className={`${styles.chip} ${statusFilter === option.value ? styles.active : ''}`}
                        onClick={() => onStatusChange(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Фильтр по дате */}
            <div className={styles.dateFilters}>
                {/* Пресеты */}
                <div className={styles.presetChips}>
                    {(['today', 'week', 'month', 'custom'] as DatePreset[]).map((preset) => (
                        <button
                            key={preset}
                            className={`${styles.presetChip} ${datePreset === preset ? styles.active : ''}`}
                            onClick={() => onDatePresetChange(preset)}
                        >
                            {PRESET_LABELS[preset]}
                        </button>
                    ))}
                </div>

                {/* DateTimePicker для custom */}
                {isCustom && (
                    <div className={styles.datePickers}>
                        <div className={styles.datePickerGroup}>
                            <span className={styles.dateLabel}>С</span>
                            <DateTimePicker
                                value={dateRange.from || ''}
                                onChange={handleDateFromChange}
                            />
                        </div>
                        <div className={styles.datePickerGroup}>
                            <span className={styles.dateLabel}>По</span>
                            <DateTimePicker
                                value={dateRange.to || ''}
                                onChange={handleDateToChange}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
