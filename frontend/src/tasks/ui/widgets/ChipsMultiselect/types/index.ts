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
}
