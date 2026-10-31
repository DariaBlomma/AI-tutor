import type { ReactNode } from 'react';

import { Spinner, type SpinnerProps } from './Spinner.tsx';
import { useDelayedVisible } from './useDelayedVisible.ts';
import styles from './LoadingWidget.module.scss';

export interface LoadingWidgetProps {
    /** `true` — идёт загрузка. Быстрые ответы (<showDelayMs) не показывают спиннер вовсе. */
    active: boolean;
    /** Пауза перед показом спиннера, мс. */
    showDelayMs?: number;
    /**
     * Режим позиционирования относительно контента:
     *  - `block` (умолч.) — own блок-контейнер над контентом (для условных рендеров);
     *  - `overlay` — абсолютно позиционированная подложка поверх всего родителя
     *    (родитель должен иметь position: relative и заданную высоту/контент).
     */
    mode?: 'block' | 'overlay';
    /** Оверлей затемняет и блокирует контент под собой (только в `mode="overlay"`). */
    dimContent?: boolean;
    /** Дополнительно показать подпись под спиннером (по умолчанию — нет). */
    label?: string | null;
    /** Параметры кольца-спиннера (size, thickness). */
    spinner?: SpinnerProps;
    children?: ReactNode;
}

// Единый «виджет загрузки»: стабильная позиция + спиннер по центру области.
// Спиннер — чистый CSS (вращающееся кольцо), без текста и пульсации: само
// вращение показывает состояние загрузки. В `overlay` режиме закрывает весь
// родительский виджет полупрозрачной подложкой — контент под ней виден, но
// страница не «прыгает» высотой при переключении состояний.
//
//   <LoadingWidget active={isLoading}>
//       <TaskList ... />
//   </LoadingWidget>
//
// role="status" + aria-live: AT озвучивает появление спиннера; скрытый оверлей
// получает aria-hidden и pointer-events none, чтобы не перехватывать клики.
export function LoadingWidget({
    active,
    showDelayMs = 150,
    mode = 'block',
    dimContent = false,
    label = null,
    spinner,
    children,
}: LoadingWidgetProps) {
    const visible = useDelayedVisible(active, showDelayMs);
    const overlay = mode === 'overlay';

    return (
        <div className={`${styles.widget} ${overlay ? styles.overlay : ''}`}>
            {children}
            <div
                className={`${styles.scrim} ${dimContent ? styles.dim : ''} ${visible ? styles.visible : ''}`}
                role="status"
                aria-live="polite"
                aria-hidden={!visible}
            >
                <span className={styles.center}>
                    <Spinner {...spinner} />
                    {label !== null && <span className={styles.label}>{label}</span>}
                </span>
            </div>
        </div>
    );
}
