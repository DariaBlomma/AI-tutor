import type { ReactNode } from 'react';

import { IconTrapezoidShape } from '@/shared/icons';

import styles from './BaseButtonTrapezoid.module.scss';

interface BaseButtonTrapezoidProps {
    label: string;
    variant: 'filled' | 'outline';
    disabled?: boolean;
    type?: 'button' | 'submit';
    onClick?: () => void;
    children?: ReactNode;
}

// Трапеция из макета вынесена в shared/icons/IconTrapezoidShape — переиспользуется здесь и в профиле.
export function BaseButtonTrapezoid({ label, variant, disabled, type = 'button', onClick, children }: BaseButtonTrapezoidProps) {
    return (
        <button
            type={type}
            className={styles.button}
            disabled={disabled}
            onClick={onClick}
        >
            <IconTrapezoidShape className={styles.border} variant={variant}/>
            <span className={variant === 'filled' ? styles.labelFilled : styles.labelOutline}>
                {label}
            </span>
            {children}
        </button>
    );
}
