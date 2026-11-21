import type { IconProps } from './types';

export function IconCheck({ className, width = 18, height = 18 }: IconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {/* Короткий изящный изгиб вниз и длинный плавный изгиб вверх */}
            <path d="M3.5 9.5 Q5.5 12.5 7.2 13 Q11 8 14.5 4.5" />
        </svg>
    );
}