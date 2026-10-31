export interface BaseSelectMultiProps<TValue extends string = string> {
    /** Плоский список опций (value — строка; числовые id фильтров кодируются через String(id)). */
    options: ReadonlyArray<{ value: TValue; label: string }>;
    /** Значение — массив выбранных value. */
    value: readonly TValue[];
    onChange: (value: TValue[]) => void;
    placeholder?: string;
    isDisabled?: boolean;
    /** Дополнительный класс к контейнеру селекта. */
    className?: string;
    ariaLabel?: string;
}
