/** Минимальный элемент справочника для отображения чипом. */
export interface ChipItem {
    id: number;
    name: string;
}

export interface ChipsMultiselectProps {
    items: ChipItem[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    /** Путь страницы управления справочником (кнопка «+»). Без него кнопка не рендерится. */
    manageTo?: '/tasks-bank/topics' | '/tasks-bank/task-types';
    /**
     * Режим одиночного выбора (фильтры банка заданий): клик по чипу переключает
     * единственный выбранный id, повторный клик снимает выбор (пусто = «Все»).
     */
    single?: boolean;
    /** Подпись кнопки сброса фильтра (рендерится, если передана и есть выбор). */
    onClear?: () => void;
    clearLabel?: string;
}
