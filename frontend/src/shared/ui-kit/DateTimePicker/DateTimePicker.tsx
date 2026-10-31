import { useEffect, useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/ru';
import styles from './DateTimePicker.module.scss';

dayjs.extend(localizedFormat);

const VALUE_FORMAT = 'YYYY-MM-DDTHH:mm'; // формат datetime-local (совместим с API и бэкендом)
const DISPLAY_FORMAT = 'DD.MM.YYYY HH:mm';

interface DateTimePickerProps {
    /** Значение в формате datetime-local ('YYYY-MM-DDTHH:mm') или '' (не выбрано). */
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
}

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Сетка месяца: недели с понедельника, стабильная высота панели.
function buildMonthGrid(view: dayjs.Dayjs): dayjs.Dayjs[] {
    const first = view.startOf('month');
    const offset = (first.day() + 6) % 7; // Пн=0 … Вс=6
    const start = first.subtract(offset, 'day');
    return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = [0, 15, 30, 45];

/**
 * Поле выбора даты и времени: триггер открывает Radix Popover с календарём
 * (навигация по месяцам, подсветка сегодня/выбранного дня) и выбором времени.
 * Календарь построен на date-fns locale + dayjs, значение — строка datetime-local.
 */
export function DateTimePicker({ value, onChange, placeholder = 'Не выбрано', id }: DateTimePickerProps) {
    const selected = useMemo(() => (value && dayjs(value).isValid() ? dayjs(value) : null), [value]);
    const today = useMemo(() => dayjs(), []);

    const [open, setOpen] = useState(false);
    // Просматриваемый месяц панели: выбранный день либо текущий.
    const [viewDate, setViewDate] = useState<dayjs.Dayjs>(() => selected ?? today);
    const [hour, setHour] = useState<number>(selected?.hour() ?? 18);
    const [minute, setMinute] = useState<number>(selected?.minute() ?? 0);

    // При каждом открытии синхронизируем месяц и время с выбранным значением.
    useEffect(() => {
        if (open) {
            const base = selected ?? dayjs();
            setViewDate(base);
            setHour(selected?.hour() ?? 18);
            setMinute(selected?.minute() ?? 0);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const days = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

    const pickDay = (date: dayjs.Dayjs) => {
        onChange(date.hour(hour).minute(minute).format(VALUE_FORMAT));
    };

    const applyTime = (h: number, m: number) => {
        setHour(h);
        setMinute(m);
        const base = selected ?? dayjs();
        onChange(base.hour(h).minute(m).format(VALUE_FORMAT));
    };

    const shiftMonth = (delta: number) => {
        setViewDate((prev) => prev.add(delta, 'month'));
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    id={id}
                    className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                >
                    <span className={`${styles.triggerText} ${!value ? styles.placeholder : ''}`}>
                        {value ? dayjs(value).format(DISPLAY_FORMAT) : placeholder}
                    </span>
                    <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className={styles.panel}
                    sideOffset={6}
                    align="start"
                    collisionPadding={12}
                    role="dialog"
                    aria-label="Выбор даты и времени"
                >
                    <div className={styles.header}>
                        <button type="button" className={styles.navBtn} onClick={() => shiftMonth(-1)} aria-label="Предыдущий месяц">
                            ‹
                        </button>
                        <div className={styles.monthTitle}>
                            {viewDate.locale('ru').format('MMMM YYYY')}
                        </div>
                        <button type="button" className={styles.navBtn} onClick={() => shiftMonth(1)} aria-label="Следующий месяц">
                            ›
                        </button>
                    </div>

                    <div className={styles.weekdays}>
                        {WEEKDAYS_SHORT.map((w) => (
                            <span key={w} className={styles.weekday}>
                                {w}
                            </span>
                        ))}
                    </div>

                    <div className={styles.grid}>
                        {days.map((date) => {
                            const isSelected = !!selected && selected.isSame(date, 'day');
                            const isToday = date.isSame(today, 'day');
                            return (
                                <button
                                    type="button"
                                    key={date.format('YYYY-MM-DD')}
                                    className={[
                                        styles.day,
                                        date.month() !== viewDate.month() ? styles.dayMuted : '',
                                        isToday ? styles.dayToday : '',
                                        isSelected ? styles.daySelected : '',
                                    ].join(' ')}
                                    onClick={() => pickDay(date)}
                                >
                                    {date.date()}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.timeRow}>
                        <label className={styles.timeLabel}>
                            Время
                            <select
                                className={styles.timeSelect}
                                value={hour}
                                onChange={(e) => applyTime(Number(e.target.value), minute)}
                                aria-label="Часы"
                            >
                                {HOUR_OPTIONS.map((h) => (
                                    <option key={h} value={h}>
                                        {String(h).padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                            <span className={styles.timeColon}>:</span>
                            <select
                                className={styles.timeSelect}
                                value={minute}
                                onChange={(e) => applyTime(hour, Number(e.target.value))}
                                aria-label="Минуты"
                            >
                                {MINUTE_OPTIONS.map((m) => (
                                    <option key={m} value={m}>
                                        {String(m).padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className={styles.timeActions}>
                            <button
                                type="button"
                                className={styles.clearBtn}
                                onClick={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                            >
                                Очистить
                            </button>
                            <button type="button" className={styles.todayBtn} onClick={() => pickDay(dayjs())}>
                                Сегодня
                            </button>
                        </div>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
