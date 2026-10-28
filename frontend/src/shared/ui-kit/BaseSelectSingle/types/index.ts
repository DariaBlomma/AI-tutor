export interface BaseSelectOption<TValue extends string = string> {
    value: TValue;
    label: string;
}

export interface BaseSelectSingleProps<TValue extends string = string> {
    options: ReadonlyArray<BaseSelectOption<TValue>>;
    value: TValue | null | undefined;
    onChange: (value: TValue) => void;
    placeholder?: string;
    isDisabled?: boolean;
    /** Дополнительный класс к контейнеру селекта. */
    className?: string;
    ariaLabel?: string;
}
