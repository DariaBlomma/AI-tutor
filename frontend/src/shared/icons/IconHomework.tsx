import type { IconProps } from './types';

export function IconHomework({ className, width = 24, height = 24 }: IconProps) {
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
            <path d="M10 8 H38 V40 H10 Z M16 16 H32 M16 24 H32 M16 32 H26" />
        </svg>
    );
}
