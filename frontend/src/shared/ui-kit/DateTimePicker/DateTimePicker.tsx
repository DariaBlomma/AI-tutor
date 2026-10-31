import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './DateTimePicker.module.scss';

interface DateTimePickerProps {
    /** Значение в формате datetime-local ('YYYY-MM-DDTHH:mm') или '' (не выбрано). */
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

// 'YYYY-MM-DDTHH:mm' -> Date (локальное время) | null
function parseValue(value: string): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

// Date -> 'YYYY-MM-DDTHH:mm' (локальное время, формат datetime-local)
function toInputValue(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS_RU = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

interface DayCell {
    date: Date;
    inMonth: boolean;
}

// Сетка месяца: недели с понедельника, 6 рядов для стабильной высоты календаря.
function buildMonthGrid(year: number, month: number): DayCell[] {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Пн=0 … Вс=6
    const start = new Date(year, month, 1 - startOffset);
    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        cells.push({ date, inMonth: date.getMonth() === month });
    }
    return cells;
}

const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Кастомный date-time picker: поле-триггер открывает панель с календарём (навигация по месяцам,
 * подсветка сегодня/выбранного дня) и выбором времени (часы:минуты). Без внешних зависимостей,
 * стилизован под тёмную тему сайта. Значение — строка datetime-local, синхронная с нативным input.
 */
export function DateTimePicker({ value, onChange, placeholder = 'Не выбрано', id }: DateTimePickerProps) {
    const selected = useMemo(() => parseValue(value), [value]);
    const today = useMemo(() => new Date(), []);

    const [open, setOpen] = useState(false);
    // Просматриваемый месяц панели: выбранный день либо текущий.
    const [viewDate, setViewDate] = useState(() => selected ?? today);
    const [timeValue, setTimeValue] = useState(() => {
        if (!selected) return '';
        return `${pad(selected.getHours())}:${pad(selected.getMinutes())}`;
    });

    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // При каждом открытии подсвечиваем месяц выбранной даты (или текущий).
    useEffect(() => {
        if (open) {
            const base = selected ?? new Date();
            setViewDate(base);
            setTimeValue(selected ? `${pad(selected.getHours())}:${pad(selected.getMinutes())}` : '');
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Закрытие по клику вне компонента и по Esc (с возвратом фокуса на триггер).
    useEffect(() => {
        if (!open) return;
        const onDocMouseDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const days = useMemo(() => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);

    const pickDay = (date: Date) => {
        const [h, m] = timeValue ? timeValue.split(':').map(Number) : [selected?.getHours() ?? 18, selected?.getMinutes() ?? 0];
        const next = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
        onChange(toInputValue(next));
    };

    const handleTimeChange = (raw: string) => {
        setTimeValue(raw);
        const match = /^(\d{1,2}):(\d{2})$/.exec(raw);
        if (!match) return;
        const hour = Number(match[1]);
        const minute = Number(match[2]);
        if (hour > 23 || minute > 59) return;
        const base = selected ?? new Date();
        onChange(toInputValue(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute)));
    };

    const shiftMonth = (delta: number) => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    const displayValue = value
        ? `${String(value).replace('T', ' ')}`
        : '';

    return (
        <div className={styles.root} ref={rootRef}>
            <button
                type="button"
                id={id}
                ref={triggerRef}
                className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <span className={`${styles.triggerText} ${!displayValue ? styles.placeholder : ''}`}>
                    {displayValue || placeholder}
                </span>
                <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            </button>

            {open && (
                <div className={styles.panel} role="dialog" aria-label="Выбор даты и времени">
                    <div className={styles.header}>
                        <button type="button" className={styles.navBtn} onClick={() => shiftMonth(-1)} aria-label="Предыдущий месяц">
                            ‹
                        </button>
                        <div className={styles.monthTitle}>
                            {MONTHS_RU[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </div>
                        <button type="button" className={styles.navBtn} onClick={() => shiftMonth(1)} aria-label="Следующий месяц">
                            ›
                        </button>
                    </div>

                    <div className={styles.weekdays}>
                        {WEEKDAY_SHORT.map((w) => (
                            <span key={w} className={styles.weekday}>
                                {w}
                            </span>
                        ))}
                    </div>

                    <div className={styles.grid}>
                        {days.map(({ date, inMonth }) => {
                            const isSelected = !!selected && sameDay(date, selected);
                            const isToday = sameDay(date, today);
                            return (
                                <button
                                    type="button"
                                    key={date.toISOString()}
                                    className={[
                                        styles.day,
                                        !inMonth ? styles.dayMuted : '',
                                        isToday ? styles.dayToday : '',
                                        isSelected ? styles.daySelected : '',
                                    ].join(' ')}
                                    onClick={() => pickDay(date)}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.timeRow}>
                        <label className={styles.timeLabel}>
                            Время
                            <input
                                type="time"
                                className={styles.timeInput}
                                value={timeValue}
                                onChange={(e) => handleTimeChange(e.target.value)}
                            />
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
                            <button type="button" className={styles.todayBtn} onClick={() => pickDay(new Date())}>
                                Сегодня
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
