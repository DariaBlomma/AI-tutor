import * as Popover from '@radix-ui/react-popover';

import type { TaskDeletePopupProps } from './types';
import styles from './TaskDeletePopup.module.scss';

// Пустой прямоугольник — фолбэк, если якорь вдруг недоступен (кнопка размонтирована).
const EMPTY_RECT: DOMRect = new DOMRect();

// Попап подтверждения удаления задания — маленький «попвер» рядом с кнопкой «Удалить»,
// НЕ полноэкранная модалка с затемнением. Реализован на Radix Popover: портал,
// автопозиционирование по якорю (кнопке), flip/shift в пределах экрана, закрытие по
// клику вне и Esc — всё из коробки.
export function TaskDeletePopup({ taskName, busy = false, getAnchorRect, open, onOpenChange, onConfirm }: TaskDeletePopupProps) {
    return (
        <Popover.Root open={open} onOpenChange={(next) => !next && onOpenChange()}>
            {/* Невидимый якорь поверх кнопки-удаления конкретной карточки (координаты отдаёт вызывающая сторона). */}
            <Popover.Anchor virtualRef={{ current: { getBoundingClientRect: () => getAnchorRect() ?? EMPTY_RECT } }} />
            <Popover.Portal>
                <Popover.Content
                    className={styles.popup}
                    side="bottom"
                    align="end"
                    sideOffset={8}
                    collisionPadding={12}
                    onEscapeKeyDown={(e) => {
                        // Во время запроса на удаление Esc не закрывает попап.
                        if (busy) e.preventDefault();
                    }}
                    onPointerDownOutside={(e) => {
                        if (busy) e.preventDefault();
                    }}
                    onInteractOutside={(e) => {
                        if (busy) e.preventDefault();
                    }}
                >
                    <div className={styles.text}>Удалить задание «{taskName}»?</div>
                    <div className={styles.actions}>
                        <Popover.Close asChild>
                            <button type="button" className={styles.btnGhost} disabled={busy}>
                                Отмена
                            </button>
                        </Popover.Close>
                        <button type="button" className={styles.btnDanger} onClick={onConfirm} disabled={busy}>
                            {busy ? 'Удаление…' : 'Удалить'}
                        </button>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
