import styles from './AppSidebar.module.scss';

interface ChevronIconProps {
    direction: 'left' | 'right';
}

export function ChevronIcon({ direction }: ChevronIconProps) {
    return (
        <svg
            className={styles.chevronIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {direction === 'left' ? (
                <path d="M15 18l-6-6 6-6" />
            ) : (
                <path d="M9 18l6-6-6-6" />
            )}
        </svg>
    );
}
