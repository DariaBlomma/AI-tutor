/** Элемент справочника для отображения в чипе. */
export interface ChipItem {
    id: number;
    name: string;
}

/** Пропсы для ChipsMultiselect. */
export interface ChipsMultiselectProps {
    items: ChipItem[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    manageTo?: string;
    single?: boolean;
    onClear?: () => void;
    clearLabel?: string;
}
