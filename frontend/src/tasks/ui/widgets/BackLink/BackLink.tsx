import { Link } from '@tanstack/react-router';
import styles from './BackLink.module.scss';

export function BackLink() {
    return (
        <Link to="/tasks-bank" className={styles.backLink}>
            {'\u2190'} К банку заданий
        </Link>
    );
}
