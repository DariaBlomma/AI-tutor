import { useId } from 'react';

import type { IconProps } from './types';

// Трапеция из макета: скос слева, основание шире вершины.
// Переиспользуется как фон кнопок (ui-kit) и каркаса форм авторизации/профиля.
export const TRAPEZOID_PATH = 'M 23 0 L 257 0 L 280 36 L 0 36 Z';

interface IconTrapezoidShapeProps extends IconProps {
    variant?: 'filled' | 'outline';
}

// Градиент объявляется внутри каждого экземпляра с уникальным id (useId):
// раньше он выносился отдельным компонентом на страницу, и на экранах
// авторизации ссылка url(#...) не разрешалась — кнопки оставались без заливки.
export function IconTrapezoidShape({ className, width, height, variant = 'outline' }: IconTrapezoidShapeProps) {
    const gradientId = `trapezoid-gradient-${useId()}`;

    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 280 36"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            {variant === 'filled' && (
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9D7CF2"/>
                        <stop offset="100%" stopColor="#7B5FD4"/>
                    </linearGradient>
                </defs>
            )}
            <path
                d={TRAPEZOID_PATH}
                fill={variant === 'filled' ? `url(#${gradientId})` : 'none'}
                stroke="var(--p)"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}
