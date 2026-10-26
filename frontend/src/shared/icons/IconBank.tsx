import type { IconProps } from './types';

export function IconBank({ className, width = 24, height = 24 }: IconProps) {
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
            <path d="M6 40 V14 H18 L24 8 L30 14 H42 V40 Z"/>
        </svg>
    );
}
