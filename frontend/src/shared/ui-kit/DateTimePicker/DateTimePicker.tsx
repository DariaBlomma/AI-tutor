import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import Button from '@mui/material/Button';
import MuiPopper from '@mui/material/Popper';
import type { PopperProps } from '@mui/material/Popper';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker as DateTimePickerMui } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { PickersLayoutProps } from '@mui/x-date-pickers/PickersLayout';
// PickerValue — тип значения пикера (нужен для типизации слота layout).
import type { PickerValue } from '@mui/x-date-pickers/internals';
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
            // Глобальный маркер-класс на корне поппера: BaseModal по нему определяет,
            // что клик «снаружи» модалки (pointerdown/interact/focus) пришёл в панель
            // пикера и НЕ закрывает модалку задачи. Класс именно глобальный (не CSS
            // module), т.к. на него смотрит код вне этого модуля — см. isInsidePopupLayer.
            className={['picker-panel-root', styles.panelRoot, popperProps.className]
                .filter(Boolean)
                .join(' ')}
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
 *
 * ПОВЕДЕНИЕ ЗАКРЫТИЯ: панель пикера живёт по ШТАТНЫМ правилам MUI (открылась по
 * клику на иконку — закрылась по клику мимо/Esc/выбору времени). Мы НЕ боремся
 * с автозакрытием самой панели: все прежние попытки (перехваты onClose/Esc на
 * document-capture, мутации приватного контекста, preventDefault на поле) либо
 * не срабатывали из-за deferPointerDownOutside в Radix, либо ломали выделение
 * секций поля и вызывали re-render штормы (Maximum call stack size exceeded).
 * Крестик и «Применить» оставлены как явные способы закрыть панель.
 *
 * ГЛАВНОЕ: клики внутри панели НЕ закрывают модалку задачи — это обеспечивает
 * BaseModal (isInsidePopupLayer + onEscapeKeyDown), т.к. панель рендерится в
 * body вне DOM-дерева Dialog.Content и Radix считает её «кликом снаружи».
 * Внешний API прежний: значение — строка datetime-local, '' означает «не выбрано».
 */
export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const parsed = useMemo(() => (value && dayjs(value).isValid() ? dayjs(value) : null), [value]);

    const handleChange = (next: Dayjs | null) => {
        onChange(next ? next.format(VALUE_FORMAT) : '');
    };

    // Свой layout панели: сверху — крестик, снизу — кнопка «Применить»; оба просто
    // закрывают попап пикера (setOpen(false)) и не трогают модалку.
    // ВАЖНО 1: MUI вызывает слот layout КАК ФУНКЦИЮ без remount-а между рендерами,
    // поэтому ссылка на компонент обязана быть СТАБИЛЬНОЙ: новое определение функции
    // на каждый рендер = размонтирование/перемонтирование всего поддерева панели при
    // каждом клике (отсюда «Maximum call stack size exceeded»). Храним в useState.
    // ВАЖНО 2: собственные DOM-пропсы в корневой div передавать НЕЛЬЗЯ —
    // PickersLayoutProps содержит slotProps/slots/className и т.п., которые
    // уходят прямо в <div> (warning «React does not recognize the `slotProps`
    // prop on a DOM element»). Рендерим только children + свои кнопки.
    const [PickerLayout] = useState<{
        (props: PickersLayoutProps<PickerValue>): ReactElement;
        displayName?: string;
    }>(() => {
        function PickerLayoutPanel({ children }: PickersLayoutProps<PickerValue>) {
            return (
                <div className={styles.layoutRoot}>
                    <button
                        type="button"
                        className={styles.dismissBtn}
                        aria-label="Закрыть"
                        onClick={() => setOpen(false)}
                    >
                        ×
                    </button>
                    {children}
                    <div className={styles.layoutFooter}>
                        <Button variant="contained" size="small" onClick={() => setOpen(false)}>
                            Применить
                        </Button>
                    </div>
                </div>
            );
        }
        PickerLayoutPanel.displayName = 'PickerLayout';
        return PickerLayoutPanel;
    });

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
                        // Не закрывать панель сразу после выбора даты: пользователю
                        // ещё нужно выбрать время (штатная настройка MUI, ничего не
                        // перехватываем — только стандартный проп).
                        closeOnSelect={false}
                        slotProps={{
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
                        slots={{ popper: AnchoredPopper, layout: PickerLayout }}
                    />
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
