import type { IconProps } from './types';

export function IconReports({ className, width = 24, height = 24 }: IconProps) {
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
            <path d="M6 38 L12 28 L18 38 Z M18 38 L24 20 L30 38 Z M30 38 L36 10 L42 38 Z M6 43 H42"/>
        </svg>
    );
}
