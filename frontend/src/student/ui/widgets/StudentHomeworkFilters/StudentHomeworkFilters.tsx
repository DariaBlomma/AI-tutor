import { useMemo, useCallback } from 'react';
import { PRESET_LABELS } from '@/student/utils/datePresets.ts';
import { FILTER_CHIP_LABELS, UITaskStatus } from '@/task/types/ui';
import { DateTimePicker } from '@/shared/ui-kit/DateTimePicker/DateTimePicker';
import type { StudentHomeworkFiltersProps } from '@/student/types/ui';
import styles from './StudentHomeworkFilters.module.scss';

/** Статусы, для которых datePreset показывается (только для завершённых). */
const PRESET_STATUSES: FilterChipType[] = [UITaskStatus.COMPLETED, UITaskStatus.OVERDUE];

const STATUS_OPTIONS: Array<{ value: FilterChipType; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: UITaskStatus.NEW, label: 'Новое' },
    { value: UITaskStatus.URGENT, label: 'Скоро дедлайн' },
    { value: UITaskStatus.IN_PROGRESS, label: 'В процессе' },
    { value: UITaskStatus.COMPLETED, label: 'Выполнено' },
    { value: UITaskStatus.OVERDUE, label: 'Просрочено' },
];

export function StudentHomeworkFilters({
    statusFilter,
    onStatusChange,
    datePreset,
    onDatePresetChange,
    onDatePresetClear,
    dateRange,
    onDateRangeChange,
}: StudentHomeworkFiltersProps) {
    const isCustom = datePreset === 'custom';
    const showPresets = PRESET_STATUSES.includes(statusFilter);

    const handleDateFromChange = useMemo(() => (value: string) => {
        onDateRangeChange({ ...dateRange, from: value });
    }, [dateRange, onDateRangeChange]);

    const handleDateToChange = useMemo(() => (value: string) => {
        onDateRangeChange({ ...dateRange, to: value });
    }, [dateRange, onDateRangeChange]);

    const handlePresetClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDatePresetClear();
    }, [onDatePresetClear]);

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
            {showPresets && (
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
                                {datePreset === preset && (
                                    <span
                                        className={styles.presetClear}
                                        onClick={handlePresetClear}
                                        aria-label="Сбросить пресет"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') handlePresetClear(e as unknown as React.MouseEvent);
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                    </span>
                                )}
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
                                    onClear={() => handleDateFromChange('')}
                                />
                            </div>
                            <div className={styles.datePickerGroup}>
                                <span className={styles.dateLabel}>По</span>
                                <DateTimePicker
                                    value={dateRange.to || ''}
                                    onChange={handleDateToChange}
                                    onClear={() => handleDateToChange('')}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
