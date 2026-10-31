import styles from './Spinner.module.scss';

export interface SpinnerProps {
    /** Диаметр спиннера, пикс. */
    size?: number;
    /** Толщина кольца, пикс. */
    thickness?: number;
}

// Чистый CSS-спиннер: кольцо с незакрашенным сегментом, бесконечно вращается —
// само движение и есть индикация загрузки (без пульсации и подписей).
// Цвет — var(--p): наследует акцентный цвет темы страницы.
// aria-hidden: озвучивает состояние родительский контейнер с role="status".
export function Spinner({ size = 28, thickness = 3 }: SpinnerProps) {
    return (
        <span
            className={styles.spinner}
            style={{ width: size, height: size, borderWidth: thickness }}
            aria-hidden="true"
        />
    );
}
