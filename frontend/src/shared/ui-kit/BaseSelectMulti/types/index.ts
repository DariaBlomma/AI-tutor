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
    /** Текст ошибки для отображения под селектом. */
    error?: string;
    /** Дополнительные react-select components (переопределяют/дополняют стандартные). */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components?: Record<string, any>;
}
