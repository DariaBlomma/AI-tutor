import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import MuiPopper from '@mui/material/Popper';
import type { PopperProps } from '@mui/material/Popper';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker as DateTimePickerMui } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ThemeProvider } from '@mui/material/styles';
import { dateTimePickerTheme } from './muiTheme';
import styles from './DateTimePicker.module.scss';

const VALUE_FORMAT = 'YYYY-MM-DDTHH:mm'; // формат datetime-local (совместим с API и бэкендом)
const DISPLAY_FORMAT = 'DD.MM.YYYY HH:mm';

// z-index панели пикера: должен быть выше Radix-модалки (overlay 200 / content 201
// у BaseModal), иначе календарь рисуется под модалкой. Единый источник правды —
// здесь; используется инлайном в slotProps.popper и в CSS-оверрайде scss.
export const PICKER_POPPER_Z_INDEX = 10000;

interface DateTimePickerProps {
    /** Значение в формате datetime-local ('YYYY-MM-DDTHH:mm') или '' (не выбрано). */
    value: string;
    onChange: (value: string) => void;
}

// Radix Dialog.Content позиционируется через CSS-переменные собственного Popper'а
// (--radix-popper-*), а не инлайновым style, поэтому popper.js не может вычислить
// координаты якоря внутри модалки: панель рендерилась в точке (0,0) с нулевой
// высотой (transform: scale(0)) — «мигание» без видимого календаря. Обёртка
// передаёт попперу явно посчитанные координаты поля (getBoundingClientRect
// работает корректно) и рендерит его в body, чтобы панель не обрезалась
// stacking-контекстом формы.
// Важно: @mui/x-date-pickers v9 ожидает, что слот `popper` ведёт себя как
// MUI Popper c transition=true: children — это render-функция
// ({ TransitionProps }), которые ОБЯЗАТЕЛЬНО пробрасываются на MuiPopper
// вместе с transition={true}. Без них Grow не монтирует содержимое панели —
// то самое «календарь моргает и не появляется».
function AnchoredPopper(popperProps: PopperProps) {
    const { children } = popperProps;
    const anchorEl = popperProps.anchorEl;
    // anchorEl может быть функцией-геттером — приводим к элементу.
    const anchorNode = typeof anchorEl === 'function' ? anchorEl() : anchorEl;
    const rect = anchorNode?.getBoundingClientRect();

    const computePositionAnchor = () => {
        if (!rect || typeof window === 'undefined') return { x: 0, y: 0 };
        const width = 340; // примерная ширина панели — прижим к правому краю экрана
        const x = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
        const y = Math.min(rect.bottom + 4, Math.max(8, window.innerHeight - 420));
        return { x, y };
    };

    return (
        <MuiPopper
            {...popperProps}
            transition
            placement="bottom-start"
            container={typeof window !== 'undefined' ? document.body : undefined}
            // z-index: MUI Popper сам по себе его не задаёт, а наш слот подменяет
            // дефолтный PickerPopperRoot (styled-компонент с zIndex из темы).
            // Инлайн-стили мёржатся со style из slotProps.popper (mergeSlotProps),
            // поэтому z-index проставляем здесь — надёжнее, чем CSS-классами.
            style={{ ...popperProps.style, zIndex: PICKER_POPPER_Z_INDEX }}
            popperOptions={{
                ...popperProps.popperOptions,
                strategy: 'fixed',
                modifiers: [
                    ...(popperProps.popperOptions?.modifiers ?? []),
                    { name: 'computePositionAnchor', enabled: true, fn: computePositionAnchor },
                ],
            }}
        >
            {children}
        </MuiPopper>
    );
}

/**
 * Поле выбора даты и времени на @mui/x-date-pickers v9: обычный календарь для
 * даты и циферблат для времени (сначала выбираем часы, затем минуты — штатное
 * поведение TimeView в Desktop-пикере MUI). Акцентный цвет переопределён на наш
 * фиолетовый через локальную MUI-тему (muiTheme.ts), которая не подмешивается
 * в глобальные стили приложения (см. CODE_STYLE.md про чужие UI-киты).
 * Панель рендерится в body через портал с фиксированным позиционированием —
 * см. комментарий у AnchoredPopper.
 * Контроль открытия в v9 — через open + onOpen/onClose (onOpenChange удалён из
 * API): закрытие по клику вне/Esc/выборе значения MUI сам вызывает onClose.
 * Внешний API прежний: значение — строка datetime-local, '' означает «не выбрано».
 */
export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const parsed = useMemo(() => (value && dayjs(value).isValid() ? dayjs(value) : null), [value]);

    const handleChange = (next: Dayjs | null) => {
        onChange(next ? next.format(VALUE_FORMAT) : '');
    };

    return (
        <ThemeProvider theme={dateTimePickerTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                <div className={styles.root}>
                    <DateTimePickerMui
                        value={parsed}
                        onChange={handleChange}
                        open={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        // ВАЖНО: НЕ используем keepOpenDuringFieldFocus — в v9 он навешивает
                        // onFocus/onMouseDown на корень поля и сам открывает панель при любом
                        // фокусе/клике (календарь появлялся сразу при открытии попапа). В v9
                        // слот `field` принимает плоские пропсы, которые мёржатся с внутренними
                        // обработчиками поля (см. DateTimeFieldSlots): наши onFocus/onMouseDown
                        // вызываются раньше штатных и через preventDefault блокируют автооткрытие
                        // MUI. При этом клик по инпуту продолжает работать как обычно (фокус/
                        // выделение секции), а панель открывается только кнопкой-иконкой (onOpen).
                        slotProps={{
                            field: {
                                onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
                                    event.preventDefault();
                                },
                                onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => {
                                    event.preventDefault();
                                },
                            },
                            textField: {
                                fullWidth: true,
                                size: 'small',
                            },
                            // z-index панели: наш слот AnchoredPopper заменяет дефолтный
                            // PickerPopperRoot (берёт zIndex из theme.zIndex.modal) на голый
                            // MUI Popper без z-index, поэтому поднимаем панель над Radix-модалкой
                            // (overlay 200 / content 201 у BaseModal) инлайном — popperProps
                            // мёржатся с внутренними пропсами поппера (useSlotProps в v9).
                            // Дублирующий CSS-оверрайд (.MuiPickerPopper-root) — в scss.
                            popper: {
                                style: { zIndex: PICKER_POPPER_Z_INDEX },
                            },
                        }}
                        format={DISPLAY_FORMAT}
                        slots={{ popper: AnchoredPopper }}
                    />
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
