import type { RefObject } from 'react';

export interface TaskDeletePopupProps {
    /** Название удаляемого задания (для текста подтверждения). */
    taskName: string;
    /** true — запрос на удаление уже в полёте (кнопка «Удалить» заблокирована). */
    busy?: boolean;
    /** Кнопка-якорь «Удалить» — относительно неё Radix позиционирует попап. */
    anchorRef: RefObject<HTMLElement | null>;
    /** Открыт ли попап (контролируемое состояние — ведёт вызывающая сторона). */
    open: boolean;
    /** Закрытие (клик вне, Esc, «Отмена»). */
    onOpenChange: () => void;
    onConfirm: () => void;
}
