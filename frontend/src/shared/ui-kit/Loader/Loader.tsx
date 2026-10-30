import { ClipLoader } from 'react-spinners';

import { useDelayedVisible } from './useDelayedVisible.ts';
import styles from './Loader.module.scss';

export interface LoaderProps {
    /** Текст-подпись под спиннером; null — без подписи. По умолчанию «Загрузка…». */
    label?: string | null;
    /**
     * Управление видимостью извне: `true` — идёт загрузка. Компонент сам решает,
     * показывать ли спиннер (см. `showDelayMs`) и плавно проигрывает появление/исчезновение.
     * Без пропа — классическое поведение: компонент виден всегда (рендерится условно).
     */
    active?: boolean;
    /** Пауза перед показом спиннера, мс (только в авто-режиме). */
    showDelayMs?: number;
}

const DEFAULT_LABEL = 'Загрузка…';

// Единый лоадер приложения: спиннер react-spinners (ClipLoader) + подпись.
// Цвет задаём через cssOverride значением CSS-переменной темы --p: react-spinners
// кладёт его в inline-стиль border-color, браузер сам разрешает var() из каскада,
// поэтому компонент наследует палитру страницы и не требует цветовых пропсов.
//
// Режимы работы:
//  - <Loader active={isLoading} /> — авто-режим: быстрая загрузка не показывает спиннер
//    вовсе, длинная — показывает с плавным fade-in/fade-out (без «мигания» списка);
//  - <Loader /> — условное рендерение ({isLoading && <Loader/>}), виден сразу и всегда.
export function Loader({ label = DEFAULT_LABEL, active, showDelayMs }: LoaderProps) {
    const auto = active !== undefined;
    const delayedActive = useDelayedVisible(auto ? active : true, showDelayMs ?? 150);
    // В авто-режиме контейнер остаётся в DOM — transition opacity отыгрывает и на
    // появлении, и на исчезновении; hidden убирает элемент из потока и из AT-озвучки.
    const visible = !auto || delayedActive;

    return (
        <div
            className={`${styles.loader} ${auto ? '' : styles.immediate} ${visible ? styles.visible : ''}`}
            role="status"
            aria-live="polite"
            aria-hidden={auto && !visible}
        >
            <ClipLoader size={22} speedMultiplier={1.2} cssOverride={{ borderColor: 'var(--p)' }} />
            {label !== null && <span className={styles.label}>{label}</span>}
        </div>
    );
}
