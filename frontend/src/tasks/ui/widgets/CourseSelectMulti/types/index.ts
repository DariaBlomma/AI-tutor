export interface CourseSelectMultiProps {
    /** Плоский список опций курсов. */
    options: ReadonlyArray<{ value: string; label: string }>;
    /** Значение — массив выбранных value. */
    value: readonly string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    isDisabled?: boolean;
    /** Дополнительный класс к контейнеру селекта. */
    className?: string;
    ariaLabel?: string;
    /** Текст ошибки для отображения под селектом. */
    error?: string;
    /** Callback для создания нового курса. Возвращает текст ошибки или null при успехе. */
    onCreateCourse: (name: string) => Promise<string | null>;
}
