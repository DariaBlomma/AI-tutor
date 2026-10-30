import { ClipLoader } from 'react-spinners';

import styles from './Loader.module.scss';

export interface LoaderProps {
    /** Текст-подпись под спиннером; null — без подписи. По умолчанию «Загрузка…». */
    label?: string | null;
}

const DEFAULT_LABEL = 'Загрузка…';

// Единый лоадер приложения: спиннер react-spinners (ClipLoader) + подпись.
// Цвет задаём через cssOverride значением CSS-переменной темы --p: react-spinners
// кладёт его в inline-стиль border-color, браузер сам разрешает var() из каскада,
// поэтому компонент наследует палитру страницы и не требует цветовых пропсов.
export function Loader({ label = DEFAULT_LABEL }: LoaderProps) {
    return (
        <div className={styles.loader} role="status" aria-live="polite">
            <ClipLoader size={22} speedMultiplier={1.2} cssOverride={{ borderColor: 'var(--p)' }} />
            {label !== null && <span className={styles.label}>{label}</span>}
        </div>
    );
}
