import { Spinner, type SpinnerProps } from './Spinner.tsx';
import { useDelayedVisible } from './useDelayedVisible.ts';
import styles from './Loader.module.scss';

export interface LoaderProps {
    /**
     * Управление видимостью извне: `true` — идёт загрузка. Компонент сам решает,
     * показывать ли спиннер (см. `showDelayMs`) и плавно проигрывает появление/исчезновение.
     * Без пропа — классическое поведение: компонент виден всегда (рендерится условно).
     */
    active?: boolean;
    /** Пауза перед показом спиннера, мс (только в авто-режиме). */
    showDelayMs?: number;
    /** Параметры кольца-спиннера (size, thickness). */
    spinner?: SpinnerProps;
}

// Единый лоадер приложения: чистый CSS-спиннер (вращающееся кольцо).
// Без текста-подписи и без пульсации — само вращение показывает состояние загрузки.
// Для покрытия всей загружаемой области используйте <LoadingWidget mode="overlay">.
//
// Режимы работы:
//  - <Loader active={isLoading} /> — авто-режим: быстрая загрузка не показывает спиннер
//    вовсе, длинная — показывает с плавным fade-in/fade-out (без «мигания» списка);
//  - <Loader /> — условное рендерение ({isLoading && <Loader/>}), виден сразу и всегда.
export function Loader({ active, showDelayMs, spinner }: LoaderProps) {
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
            <Spinner size={spinner?.size ?? 24} thickness={spinner?.thickness ?? 3} />
        </div>
    );
}
