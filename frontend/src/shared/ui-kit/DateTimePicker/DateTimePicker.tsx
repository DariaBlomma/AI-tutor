import { useCallback, useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import styles from './DateTimePicker.module.scss';

const VALUE_FORMAT = "yyyy-MM-dd'T'HH:mm";
const DISPLAY_FORMAT = 'dd.MM.yyyy HH:mm';

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
}

// todo: refactor into separate datePicker and TimePicker.
//  todo: Reactor native TimePikcer into customizable one, ,maybe with 2 selects
function CalendarIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
    const [open, setOpen] = useState(false);

    const parsedDate = useMemo(() => {
        if (!value) return undefined;
        const d = parse(value, VALUE_FORMAT, new Date());
        return isValid(d) ? d : undefined;
    }, [value]);

    const [month, setMonth] = useState<Date>(parsedDate || new Date());

    useMemo(() => {
        if (parsedDate) setMonth(parsedDate);
    }, [parsedDate]);

    const handleDateSelect = useCallback(
        (date: Date | undefined) => {
            if (!date) {
                onChange('');
                return;
            }
            const currentTime = parsedDate ? format(parsedDate, 'HH:mm') : '00:00';
            onChange(format(date, `yyyy-MM-dd'T'${currentTime}`));
        },
        [onChange, parsedDate],
    );

    const handleTimeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newTime = e.target.value;
            const baseDate = parsedDate || new Date();
            onChange(format(baseDate, `yyyy-MM-dd'T'${newTime}`));
        },
        [onChange, parsedDate],
    );

    const displayValue = parsedDate ? format(parsedDate, DISPLAY_FORMAT) : 'Выбрать дату и время';

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button type="button" className={styles.trigger} aria-label="Выбрать дату и время">
                    <span className={styles.triggerText}>{displayValue}</span>
                    <CalendarIcon />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className={styles.content}
                    side="bottom"
                    align="start"
                    sideOffset={0}
                    collisionPadding={8}
                >
                    {/* 🔥 Flex-контейнер: календарь слева, время справа */}
                    <div className={styles.pickerBody}>
                        <DayPicker
                            mode="single"
                            selected={parsedDate}
                            onSelect={handleDateSelect}
                            month={month}
                            onMonthChange={setMonth}
                            locale={ru}
                            showOutsideDays
                            classNames={{
                                months: styles.months,
                                month: styles.month,
                                month_caption: styles.monthCaption, // ← изменил с caption на month_caption
                                caption_label: styles.captionLabel,
                                nav: styles.nav,
                                button_previous: styles.navButtonPrevious, // ← изменил
                                button_next: styles.navButtonNext, // ← изменил
                                dropdowns: styles.dropdowns,
                                dropdown: styles.dropdown,
                                table: styles.table,
                                head_row: styles.headRow,
                                head_cell: styles.headCell,
                                row: styles.row,
                                cell: styles.cell,
                                day: styles.day,
                                day_button: styles.dayButton,
                                selected: styles.daySelected,
                                today: styles.dayToday,
                                outside: styles.dayOutside,
                            }}
                        />

                        {/* 🔥 Поле времени справа от календаря */}
                        <div className={styles.timeColumn}>
                            <label className={styles.timeLabel}>Время</label>
                            <input
                                type="time"
                                value={parsedDate ? format(parsedDate, 'HH:mm') : '00:00'}
                                onChange={handleTimeChange}
                                className={styles.timeInput}
                            />
                        </div>
                    </div>

                    <Popover.Arrow className={styles.arrow} />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}