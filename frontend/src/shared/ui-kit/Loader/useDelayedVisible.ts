import { useEffect, useState } from 'react';

/**
 * Промежуток (мс), в течение которого спиннер ещё не показываем.
 * Быстрые ответы (<150 мс) вообще не должны вызывать появление лоадера —
 * иначе он мелькает на один кадр и список «моргает».
 */
const DEFAULT_DELAY_MS = 150;

/**
 * Возвращает `visible` с задержкой после того, как `active` стал true, и мгновенно
 * снимает флаг при `active === false`. Компонент-обёртка использует это для плавного
 * появления (transition opacity): короткий запрос не успевает показать лоадер, а
 * длинный — показывает его без рывка.
 */
export function useDelayedVisible(active: boolean, delayMs: number = DEFAULT_DELAY_MS): boolean {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!active) {
            setVisible(false);
            return;
        }
        const timer = window.setTimeout(() => setVisible(true), delayMs);
        return () => window.clearTimeout(timer);
    }, [active, delayMs]);

    return visible;
}
