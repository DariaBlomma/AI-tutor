import type { IconProps } from './types';

export function IconHome({ className, width = 24, height = 24 }: IconProps) {
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
            <path d="M24 7 L42 22 H37 V40 H11 V22 H6 Z"/>
        </svg>
    );
}
