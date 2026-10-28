import { Link } from '@tanstack/react-router';
import styles from './PlusLinkButton.module.scss';

interface PlusLinkButtonProps {
    to: string;
    /** Доступная подпись (по умолчанию — «Создать»). */
    ariaLabel?: string;
}

// Квадратная кнопка-плюс: ссылка на страницу создания/управления.
// Стандартный подход для кликабельных элементов: hover и active меняют цвет,
// не размер (см. правило в shared/styles/global.scss).
export function PlusLinkButton({ to, ariaLabel = 'Создать' }: PlusLinkButtonProps) {
    return (
        <Link to={to} className={styles.plus} aria-label={ariaLabel}>
            +
        </Link>
    );
}
