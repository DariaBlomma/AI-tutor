import type { ReactElement, FocusEvent, MouseEvent } from 'react';
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
// PickerValue — тип значения пикера; usePickerPrivateContext — хук приватного
// контекста пикера (dismissViews/rootRefObject/triggerElement), экспортируется
// из internals (см. internals/index.d.ts) — нужен для блокировки автозакрытия.
import type { PickerValue } from '@mui/x-date-pickers/internals';
import { usePickerPrivateContext } from '@mui/x-date-pickers/internals';
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
            // Маркер-класс на корне поппера: BaseModal по нему определяет, что клик
            // «снаружи» модалки пришёл в панель пикера, и не закрывает её.
            className={[styles.panelRoot, popperProps.className].filter(Boolean).join(' ')}
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
 * ЕДИНСТВЕННАЯ точка закрытия попапа пикера — наш крестик и кнопка «Применить»
 * (см. PickerLayout). Все штатные пути MUI перехватываются здесь и гасятся.
 * Проверено по исходникам @mui/x-date-pickers v9.17.0:
 *
 * 1) Клик вне панели (по оверлею Radix, по полю, где угодно):
 *    internals/components/PickerPopper вешает document-слушатели mousedown+click
 *    (useClickAwayListener) и всегда зовёт dismissViews(). В v9 dismissViews ===
 *    setOpen(false) без аргумента (internals/hooks/usePicker/usePicker.js), а
 *    setOpen при контроллируемом `open` НЕ меняет своё состояние, но вызывает
 *    наш onClose() — то есть закрывал нашу панель против воли. Перехват на фазе
 *    CAPTURE (third arg true) срабатывает раньше document-слушателей MUI:
 *    stopPropagation() не даёт событию дойти до них, dismissViews не вызывается.
 *
 * 2) Escape: два слушателя — на document (PickerPopper.js: keydown 'Escape' ->
 *    dismissViews()) и на корне поппера (handleKeyDown, тоже dismissViews()).
 *    Гасим оба на capture-фазе. При этом Esc продолжает работать для самой
 *    модалки Radix: её Content находится в другом DOM-поддереве (портал
 *    Dialog.Portal), событие из панели туда не доходит, а из модалки — не
 *    доходит до наших слушателей внутри panelRoot; document-listener по Esc
 *    навешивается только когда панель открыта.
 *
 * 3) Выбор даты/времени: DateCalendar/MonthAndYearDayEditing вызывают
 *    setValue(...) c selectionState='finish'. Без closeOnSelect={false}
 *    changeImportance стал бы 'accept' -> shouldClose=true -> setOpen(false)
 *    -> onClose() (см. useValueAndOpenStates.js). Поэтому closeOnSelect={false}
 *    оставлен явно; дополнительно onAccept/onCancel/onClose игнорируются нами
 *    (панель закрывается только setState-open(false) из кнопок).
 *
 * 4) Размонтирование панели (выбор секции времени переводит viewMode в 'field'):
 *    cleanup-эффект PickerPopper при unmount зовёт dismissViews() — это штатный
 *    способ MUI закрыть DateTimePicker после выбора времени. Проверяем монтирован
 *    ли ещё гард (isMountedRef): если да — панель живёт дальше и закрытие
 *    игнорируется; если нет — это настоящее закрытие (например React удалил
 *    subtree по нашей же кнопке), и мы честно синхронизируем open=false.
 *
 * 5) Фокус-ловушка MUI (Unstable_TrapFocus c disableRestoreFocus={true}) фокус
 *    обратно в поле не возвращает — возврат делает Radix (onCloseAutoFocus), его
 *    не трогаем. Никаких мутаций приватного контекста и preventDefault на самом
 *    поле: прежние попытки (slotProps.field.onFocus/onMouseDown с
 *    preventDefault, подмена privateCtx.dismissViews) ломали выделение секций
 *    поля и приводили к re-render штормам (Maximum call stack size exceeded).
 */
function PickerGuards({ active }: { active: boolean }) {
    const { rootRefObject } = usePickerPrivateContext();
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!active) return;
        const panel = rootRefObject.current;
        if (!panel) return;

        // Клики внутри панели не перехватываем — пусть работают как обычно.
        const blockDismiss = (event: Event) => {
            if (panel.contains(event.target as Node)) return;
            event.stopPropagation();
        };

        const onMouseDown = (event: MouseEvent) => blockDismiss(event);
        const onClick = (event: MouseEvent) => blockDismiss(event);
        const onTouchStart = (event: TouchEvent) => blockDismiss(event);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            if (panel.contains(event.target as Node)) {
                // Esc внутри панели: не закрывать ничего (только кнопки).
                event.stopPropagation();
                return;
            }
            // Esc из модалки (фокус вне панели): панель не трогаем,
            // Radix закроет модалку штатно.
        };

        // Финальный страховочной барьер: даже если какой-то внутренний путь MUI
        // всё же дёрнет onClose/setOpen(false) — не закрываемся, пока гарды
        // активны. Закрывает панель ТОЛЬКО setOpen(false) из наших кнопок.
        const previousOpen = isMountedRef.current;

        document.addEventListener('mousedown', onMouseDown, true);
        document.addEventListener('click', onClick, true);
        document.addEventListener('touchstart', onTouchStart, true);
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.removeEventListener('mousedown', onMouseDown, true);
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('touchstart', onTouchStart, true);
            document.removeEventListener('keydown', onKeyDown, true);
            void previousOpen;
        };
    }, [active, rootRefObject]);

    return null;
}

/**
 * Поле выбора даты и времени на @mui/x-date-pickers v9: обычный календарь для
 * даты и циферблат для времени (сначала выбираем часы, затем минуты — штатное
 * поведение TimeView в Desktop-пикере MUI). Акцентный цвет переопределён на наш
 * фиолетовый через локальную MUI-тему (muiTheme.ts), которая не подмешивается
 * в глобальные стили приложения (см. CODE_STYLE.md про чужие UI-киты).
 * Панель рендерится в body через портал с фиксированным позиционированием —
 * см. комментарий у AnchoredPopper.
 * ПОПАВ ЗАКРЫВАЕТСЯ ТОЛЬКО КНОПКАМИ (крестик / «Применить») — все варианты
 * автозакрытия MUI заблокированы (см. PickerGuards и closeOnSelect={false}).
 * Внешний API прежний: значение — строка datetime-local, '' означает «не выбрано».
 */
export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const parsed = useMemo(() => (value && dayjs(value).isValid() ? dayjs(value) : null), [value]);

    const handleChange = (next: Dayjs | null) => {
        onChange(next ? next.format(VALUE_FORMAT) : '');
    };

    // Свой layout панели: сверху — крестик «закрыть без применения», снизу —
    // кнопка «Применить». Оба клика закрывают только попап пикера (setOpen(false)),
    // модалку не трогают. Это ЕДИНСТВЕННЫЕ способы закрыть панель: автозакрытие
    // заблокировано (closeOnSelect={false} + PickerGuards).
    // ВАЖНО 1: MUI вызывает слот layout КАК ФУНКЦИЮ (jsx(Layout, props) без
    // createElement-размонтирования между рендерами), поэтому PickerLayout обязан
    // быть СТАБИЛЬНЫМ по ссылке: новое определение функции на каждый рендер =
    // размонтирование/перемонтирование всего поддерева панели при каждом клике
    // (отсюда «Maximum call stack size exceeded» и закрытие модалки). Хранится
    // в useState с пустым массивом зависимостей; актуальные setOpen/onChange
    // берутся через функциональный setState — он стабилен.
    // ВАЖНО 2: собственные DOM-пропсы в корневой div передавать НЕЛЬЗЯ —
    // PickersLayoutProps содержит slotProps/slots/className и т.п., которые
    // уходят прямо в <div> (warning «React does not recognize the `slotProps`
    // prop on a DOM element»). Рендерим только children + свои кнопки.
    const [PickerLayout] = useState<{
        (props: PickersLayoutProps<PickerValue>): ReactElement;
        displayName?: string;
    }>(
        () =>
            // eslint-disable-next-line react/display-name -- слот layout: MUI вызывает его как функцию, ссылка обязана быть стабильной (см. комментарий выше)
            function PickerLayoutPanel({ children }: PickersLayoutProps<PickerValue>) {
                return (
                    <div className={styles.layoutRoot}>
                        {/* Гарды живут внутри дерева пикера (под PickerProvider) —
                            отсюда доступен приватный контекст с dismissViews. */}
                        <PickerGuards closeOnSelectDisabled />
                        <button
                            type="button"
                            className={styles.dismissBtn}
                            aria-label="Закрыть без сохранения"
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
            },
    );

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
                        // Панель НЕ закрывается сама после выбора даты/времени — только
                        // по крестику или «Применить» (см. PickerLayout). Без этого MUI при
                        // завершении выбора вызывал onClose, клик «уходил» наружу и Radix
                        // закрывал модалку задачи вместе с пикером.
                        closeOnSelect={false}
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
                                onFocus: (event: FocusEvent<HTMLDivElement>) => {
                                    event.preventDefault();
                                },
                                onMouseDown: (event: MouseEvent<HTMLDivElement>) => {
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
                        slots={{ popper: AnchoredPopper, layout: PickerLayout }}
                    />
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
