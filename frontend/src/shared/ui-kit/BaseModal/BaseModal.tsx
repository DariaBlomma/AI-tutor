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

// Переиспользуемая модалка на Radix UI Dialog: портал, блокировка скролла body,
// ловушка фокуса, закрытие по Esc/оверлею, aria-доступность — из коробки библиотеки.
// Содержимое (заголовок/контент/кнопки) рисует вызывающая сторона через children.
export function BaseModal({ open, onClose, title, children }: BaseModalProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className={styles.overlay} />
                <DialogPrimitive.Content className={styles.content} aria-describedby={undefined}>
                    {/* Доступно только для скринридеров (aria-label) — визуально заголовок рисует children. */}
                    <DialogPrimitive.Title className={styles.srTitle}>{title}</DialogPrimitive.Title>
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
