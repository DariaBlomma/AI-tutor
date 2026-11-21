import type { IconProps } from './types';

export function IconCross({ className, width = 18, height = 18 }: IconProps) {
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
            <path d="M4 4 L14 14 M14 4 L4 14" />
        </svg>
    );
}
