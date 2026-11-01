import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import styles from './BaseModal.module.scss';

interface BaseModalShellProps {
    open: boolean;
    onClose: () => void;
    /** Содержимое тела модалки. */
    content: ReactNode;
    /** Нижняя секция с действиями (кнопки). */
    footer?: ReactNode;
}

export type BaseModalProps = BaseModalShellProps &
    (
        | {
              /** Видимый заголовок — становится доступным именем диалога через aria-labelledby. */
              title: ReactNode;
              ariaLabel?: never;
          }
        | {
              title?: never;
              /** Доступное имя для модалок без видимого заголовка. */
              ariaLabel: string;
          }
    );

// Переиспользуемая модалка на Radix Dialog: портал, блокировка скролла body,
// ловушка фокуса, закрытие по Esc/оверлею — из коробки библиотеки.
// Структура задаётся слотами: title / content / footer.
export function BaseModal({ open, onClose, title, ariaLabel, content, footer }: BaseModalProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className={styles.overlay} />
                <DialogPrimitive.Content
                    className={styles.content}
                    aria-label={ariaLabel}
                    aria-describedby={undefined}
                >
                    {title !== undefined && (
                        <DialogPrimitive.Title className={styles.title}>{title}</DialogPrimitive.Title>
                    )}
                    <div className={styles.body}>{content}</div>
                    {footer !== undefined && <div className={styles.footer}>{footer}</div>}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
