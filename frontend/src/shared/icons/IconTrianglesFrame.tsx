import type { IconProps } from './types';
import styles from './IconTrianglesFrame.module.scss';

// Каркас из двух треугольников (вершины смотрят друг на друга) —
// переиспользуется в формах авторизации и на странице профиля.
export function IconTrianglesFrame({ className, width = 320, height = 520 }: IconProps) {
    return (
        <svg
            className={[styles.frame, className].filter(Boolean).join(' ')}
            width={width}
            height={height}
            viewBox="0 0 400 650"
            fill="none"
            aria-hidden="true"
        >
            {/* Верхний треугольник */}
            <polygon className={styles.path} points="200,350 3,40 397,40"/>
            {/* Нижний треугольник */}
            <polygon className={styles.path} points="200,350 397,660 3,660"/>
        </svg>
    );
}
