import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import styles from './BaseModal.module.scss';

interface BaseModalProps {
    open: boolean;
    onClose: () => void;
    /** Заголовок окна (обязателен Radix для доступности — aria-label). */
    title: string;
    children: ReactNode;
}

// Всплывающие панели сторонних виджетов (MUI Popper у DateTimePicker и т.п.)
// рендерятся в document.body — вне DOM-поддерева Dialog.Content. Radix считает
// любой pointer-down за пределами контента «щелчком по оверлею» и закрывает
// модалку. Обработчик отменяет такое поведение: событие произошло внутри
// чужого поппера/тултипа — значит это НЕ клик «снаружи», модалку не трогаем.
// event.detail.originalEvent — нативный PointerEvent/MouseEvent/FocusEvent клика.
type OutsideEventLike = CustomEvent<{ originalEvent: MouseEvent | FocusEvent }>;

const isInsidePopupLayer = (event: OutsideEventLike): boolean => {
    const target = event.detail?.originalEvent?.target;
    if (!(target instanceof Element)) return false;
    // closest находит и сам target, и его предков — панель может быть кликнутой изнутри.
    // Маркер .picker-panel-root навешивает DateTimePicker (AnchoredPopper) на корень
    // своего поппера; MuiPopover-root/MuiMenu-root — на случай других всплывающих
    // MUI-виджетов внутри модалок.
    return !!target.closest('.picker-panel-root, .MuiPopover-root, .MuiMenu-root');
};

// Переиспользуемая модалка на Radix UI Dialog: портал, блокировка скролла body,
// ловушка фокуса, закрытие по Esc/оверлею, aria-доступность — из коробки библиотеки.
// Содержимое (заголовок/контент/кнопки) рисует вызывающая сторона через children.
export function BaseModal({ open, onClose, title, children }: BaseModalProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className={styles.overlay} />
                <DialogPrimitive.Content
                    className={styles.content}
                    aria-describedby={undefined}
                    onPointerDownOutside={(event) => {
                        if (isInsidePopupLayer(event)) event.preventDefault();
                    }}
                    onInteractOutside={(event) => {
                        if (isInsidePopupLayer(event)) event.preventDefault();
                    }}
                >
                    {/* Доступно только для скринридеров (aria-label) — визуально заголовок рисует children. */}
                    <DialogPrimitive.Title className={styles.srTitle}>{title}</DialogPrimitive.Title>
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
