import type { IconProps } from './types';

// Трапеция из макета: скос слева, основание шире вершины.
// Переиспользуется как фон кнопок (ui-kit) и каркаса форм авторизации/профиля.
export const TRAPEZOID_PATH = 'M 23 0 L 257 0 L 280 36 L 0 36 Z';

interface IconTrapezoidShapeProps extends IconProps {
    variant?: 'filled' | 'outline';
}

// Одиночный экземпляр градиента на страницу — ссылка url(#...) глобальна в DOM,
// поэтому градиент объявляется один раз здесь, а не в каждой кнопке.
export function IconTrapezoidGradient() {
    return (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <defs>
                <linearGradient id="trapezoid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9D7CF2"/>
                    <stop offset="100%" stopColor="#7B5FD4"/>
                </linearGradient>
            </defs>
        </svg>
    );
}

export function IconTrapezoidShape({ className, width, height, variant = 'outline' }: IconTrapezoidShapeProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 280 36"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d={TRAPEZOID_PATH}
                fill={variant === 'filled' ? 'url(#trapezoid-gradient)' : 'none'}
                stroke="var(--p)"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}
