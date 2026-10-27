import type { IconProps } from './types';

// Иконка «Копировать» (два совмещённых прямоугольника).
export function IconCopy({ className, width = 24, height = 24 }: IconProps) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="16" y="16" width="26" height="26" rx="3"/>
            <path d="M32 10 H7 A2 2 0 0 0 5 12 V37"/>
        </svg>
    );
}
