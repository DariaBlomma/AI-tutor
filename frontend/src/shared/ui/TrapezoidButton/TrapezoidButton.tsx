import type { ReactNode } from 'react';

import styles from './TrapezoidButton.module.scss';

interface TrapezoidButtonProps {
    label: string;
    variant: 'filled' | 'outline';
    disabled?: boolean;
    type?: 'button' | 'submit';
    onClick?: () => void;
    children?: ReactNode;
}

// Трапеция из макета: скос слева, основание шире вершины.
const PATH = 'M 23 0 L 257 0 L 280 36 L 0 36 Z';

export function TrapezoidButton({ label, variant, disabled, type = 'button', onClick, children }: TrapezoidButtonProps) {
    return (
        <button
            type={type}
            className={styles.button}
            disabled={disabled}
            onClick={onClick}
        >
            <svg
                className={styles.border}
                viewBox="0 0 280 36"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d={PATH}
                    fill={variant === 'filled' ? 'url(#trapezoid-gradient)' : 'none'}
                    stroke="var(--p)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                {variant === 'filled' && (
                    <defs>
                        <linearGradient id="trapezoid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9D7CF2" />
                            <stop offset="100%" stopColor="#7B5FD4" />
                        </linearGradient>
                    </defs>
                )}
            </svg>
            <span className={variant === 'filled' ? styles.labelFilled : styles.labelOutline}>
                {label}
            </span>
            {children}
        </button>
    );
}
