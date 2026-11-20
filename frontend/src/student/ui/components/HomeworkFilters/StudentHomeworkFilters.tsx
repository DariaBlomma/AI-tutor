import { useMemo } from 'react';
import type { WorkStatus } from '@/student/types/work';
import type { DatePreset, DateRange } from '@/student/hooks/useStudentHomeworkFilters';
import { PRESET_LABELS } from '@/student/lib/datePresets';
import { DateTimePicker } from '@/shared/ui-kit/DateTimePicker/DateTimePicker';
import styles from './StudentHomeworkFilters.module.scss';

export interface StudentHomeworkFiltersProps {
    statusFilter: 'all' | WorkStatus;
    onStatusChange: (status: 'all' | WorkStatus) => void;
    datePreset: DatePreset;
    onDatePresetChange: (preset: DatePreset) => void;
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
}

const STATUS_OPTIONS: Array<{ value: 'all' | WorkStatus; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'ASSIGNED', label: 'Новое' },
    { value: 'IN_PROGRESS', label: 'В процессе' },
    { value: 'COMPLETED', label: 'Выполнено' },
    { value: 'EXPIRED', label: 'Просрочено' },
];

export function StudentHomeworkFilters({
    statusFilter,
    onStatusChange,
    datePreset,
    onDatePresetChange,
    dateRange,
    onDateRangeChange,
}: StudentHomeworkFiltersProps) {
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
