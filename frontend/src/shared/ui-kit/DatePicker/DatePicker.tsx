import { useCallback, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ru } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import styles from './DatePicker.module.scss';

const DISPLAY_FORMAT = 'dd.MM.yyyy'; // формат отображения (заглушка, реальный формат задаётся CSS)

interface DatePickerProps {
    /** Значение в формате datetime-local ('YYYY-MM-DDTHH:mm') или '' (не выбрано). */
    value: string;
    onChange: (value: string) => void;
}

/**
 * Компонент выбора даты на react-day-picker v10 (Component mode).
 * Внешний API прежний: значение — строка datetime-local, '' означает «не выбрано».
 */
export function DatePicker({ value, onChange }: DatePickerProps) {
    const parsed = useMemo(() => {
        if (!value) return null;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }, [value]);

    const [month, setMonth] = useState(parsed ?? new Date());

    const handleSelect = useCallback(
        (date: Date | undefined) => {
            if (!date) {
                onChange('');
                return;
            }
            // Сохраняем текущее время из value (если есть), иначе 00:00
            const existingTime = value && value.includes('T') ? value.slice(11) : '00:00';
            const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${existingTime}`;
            onChange(formatted);
        },
        [onChange, value],
    );

    const selectedDate = parsed;

    return (
        <div className={styles.root}>
            <DayPicker
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={handleSelect}
                month={month}
                onMonthChange={setMonth}
                locale={ru}
                showOutsideDays
                classNames={{
                    months: styles.months,
                    month: styles.month,
                    nav: styles.nav,
                    button_previous: styles.navButton,
                    button_next: styles.navButton,
                    head: styles.head,
                    head_row: styles.headRow,
                    head_cell: styles.headCell,
                    row: styles.row,
                    day: styles.day,
                    day_button: styles.dayButton,
                    range_start: styles.dayRangeStart,
                    range_middle: styles.dayRangeMiddle,
                    range_end: styles.dayRangeEnd,
                    selected: styles.daySelected,
                    today: styles.dayToday,
                    outside: styles.dayOutside,
                    dropdown: styles.dropdown,
                }}
                formatters={{ formatWeekday: (_day, locale) => {
                    // Короткие названия дней недели (3 буквы)
                    const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
                    const d = new Date(day);
                    return String(days[d.getDay()]);
                }}}
            />
        </div>
    );
}
