import type { IconProps } from './types';

export function IconProfile({ className, width = 24, height = 24 }: IconProps) {
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
            <circle cx={24} cy={16} r={7}/>
            <path d="M11 41 V38 C11 30 17 27 24 27 C31 27 37 30 37 38 V41"/>
        </svg>
    );
}
