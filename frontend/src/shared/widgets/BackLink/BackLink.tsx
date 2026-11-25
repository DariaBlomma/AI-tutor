import { Link } from '@tanstack/react-router';
import styles from './BackLink.module.scss';

export interface BackLinkProps {
    /** Куда возвращаться. */
    to: string;
    /** Текст ссылки. */
    label: string;
    /** ARIA-метка для доступности. */
    ariaLabel?: string;
}

export function BackLink({ to, label, ariaLabel }: BackLinkProps) {
    return (
        <Link
            to={to as Parameters<typeof Link>[0]['to']}
            className={styles.backLink}
            aria-label={ariaLabel}
        >
            {'\u2190'} {label}
        </Link>
    );
}
