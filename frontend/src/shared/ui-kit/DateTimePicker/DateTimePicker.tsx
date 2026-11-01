import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker as DateTimePickerMui } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ThemeProvider } from '@mui/material/styles';
import { dateTimePickerTheme } from './muiTheme';
import styles from './DateTimePicker.module.scss';

const VALUE_FORMAT = 'YYYY-MM-DDTHH:mm'; // формат datetime-local (совместим с API и бэкендом)
const DISPLAY_FORMAT = 'DD.MM.YYYY HH:mm';

interface DateTimePickerProps {
    /** Значение в формате datetime-local ('YYYY-MM-DDTHH:mm') или '' (не выбрано). */
    value: string;
    onChange: (value: string) => void;
}

/**
 * Поле выбора даты и времени на @mui/x-date-pickers: обычный календарь для даты
 * и циферблат для времени (сначала выбираем часы, затем минуты — штатное
 * поведение TimeView/MeridiemView в MUI). Акцентный цвет переопределён на наш
 * фиолетовый через локальную MUI-тему (muiTheme.ts), которая не подмешивается
 * в глобальные стили приложения (см. CODE_STYLE.md про чужие UI-киты).
 * Внешний API прежний: значение — строка datetime-local, '' означает «не выбрано».
 */
export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const parsed = useMemo(() => (value && dayjs(value).isValid() ? dayjs(value) : null), [value]);

    const handleChange = (next: Dayjs | null) => {
        onChange(next ? next.format(VALUE_FORMAT) : '');
        // После выбора закрываем панель: выбор завершён.
        if (next) setOpen(false);
    };

    return (
        <ThemeProvider theme={dateTimePickerTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                <div className={styles.root}>
                    <DateTimePickerMui
                        value={parsed}
                        onChange={handleChange}
                        open={open}
                        onOpenChange={setOpen}
                        format={DISPLAY_FORMAT}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                            },
                        }}
                    />
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
