import { Link } from '@tanstack/react-router';
import styles from './BackLink.module.scss';

export interface BackLinkProps {
    /** Куда возвращаться; по умолчанию — банк заданий. */
    to?: string;
    /** Текст ссылки; по умолчанию — «К банку заданий». */
    label?: string;
}

export function BackLink({ to = '/tasks-bank', label = 'К банку заданий' }: BackLinkProps) {
    return (
        <Link to={to as Parameters<typeof Link>[0]['to']} className={styles.backLink}>
            {'\u2190'} {label}
        </Link>
    );
}
