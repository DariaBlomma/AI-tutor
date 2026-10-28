import { Link } from '@tanstack/react-router';
import styles from './BasePlusButtonLink.module.scss';

interface BasePlusButtonLinkProps {
    to: string;
    /** Доступная подпись (по умолчанию — «Создать»). */
    ariaLabel?: string;
}

// Base-компонент: квадратная кнопка-плюс — ссылка на страницу создания/управления справочником.
// Стандартный подход для кликабельных элементов: hover и active меняют цвет,
// не размер (см. правило в shared/styles/global.scss).
export function BasePlusButtonLink({ to, ariaLabel = 'Создать' }: BasePlusButtonLinkProps) {
    return (
        <Link to={to} className={styles.plus} aria-label={ariaLabel}>
            +
        </Link>
    );
}
