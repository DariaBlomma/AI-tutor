import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Защита «слоя поверх модального окна» (панель пикера, выпадающий список селекта).
 *
 * Проблема: такие слои рендерятся в body (портал), поэтому для Radix Dialog они
 * находятся СНАРУЖИ Dialog.Content, и любое взаимодействие с ними штатно
 * трактуется как клик/фокус/Tab «снаружи» -> dismiss -> закрытие модалки.
 *
 * Решение — не селекторы чужих классов и не preventDefault на each event, а два
 * штатных механизма Radix:
 *  1. DismissableLayer игнорирует pointer-down/focus внутри своих `branches`
 *     (`data-radix-dismissable-layer-branch`);
 *  2. FocusScope не считает целью ловушки элементы, помеченные
 *     `data-radix-focus-guard`.
 * Хук навешивает эти два атрибута на корень всплывающего слоя — оба канала
 * dismiss (pointerdown / interact / focus / keydown) отключаются сами, без
 * перехватов.
 *
 * Атрибуты проставляются императивно (через setAttribute), потому что слой
 * монтируется вне дерева React этого компонента (чужой портал).
 */
export function useFloatingLayerGuard(layerRef: RefObject<HTMLElement | null>): void {
    const [node, setNode] = useState<HTMLElement | null>(null);

    // Ревалидация узла по кадрам: слой появляется и исчезает асинхронно
    // (анимация MUI Popper, перемонтирование меню react-select), подписки на его
    // монтаж у нас нет. Стоимость — один closest() на кадр при открытом окне.
    useEffect(() => {
        let frame = requestAnimationFrame(function check(): void {
            setNode((prev) => {
                const next = layerRef.current;
                return prev === next ? prev : next;
            });
            frame = requestAnimationFrame(check);
        });
        return () => cancelAnimationFrame(frame);
    }, [layerRef]);

    useEffect(() => {
        if (!node) return;
        node.setAttribute('data-radix-dismissable-layer-branch', '');
        node.setAttribute('data-radix-focus-guard', '');
        return () => {
            node.removeAttribute('data-radix-dismissable-layer-branch');
            node.removeAttribute('data-radix-focus-guard');
        };
    }, [node]);
}
