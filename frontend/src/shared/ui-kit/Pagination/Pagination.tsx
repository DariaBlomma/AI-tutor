import styles from './Pagination.module.scss';
import type { PaginationProps } from './types';

// Уникальный id градиента на компонент — чтобы несколько пагинаций на странице не конфликтовали.
const GRADIENT_ID = 'ui-kit-pagination-active-gradient';

/**
 * Пагинация по дизайну: стрелки (в начало / назад / вперёд / в конец) и страницы-«треугольники».
 * Если страниц много — показываем первые/последние и вокруг текущей, остальное сворачиваем в «…».
 */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    const items = buildPageItems(page, totalPages);

    return (
        <nav className={styles.pagination} aria-label="Пагинация">
            {/* SVG-градиент для заливки активной страницы (тот же угол 135deg, что у кнопки «Создать задание»). */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <defs>
                    <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#B8A4F7" />
                        <stop offset="45%" stopColor="#9D7CF2" />
                        <stop offset="100%" stopColor="#6A4BC8" />
                    </linearGradient>
                </defs>
            </svg>

            <button type="button" className={styles.arrowBtn} onClick={() => onPageChange(0)} disabled={page === 0} aria-label="Первая страница">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                </svg>
            </button>
            <button type="button" className={styles.arrowBtn} onClick={() => onPageChange(page - 1)} disabled={page === 0} aria-label="Предыдущая страница">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            {items.map((item, idx) =>
                item === 'ellipsis' ? (
                    // Ключ по позиции: «…» может встречаться дважды.
                    <span key={`e-${idx}`} className={styles.ellipsis}>
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        className={`${styles.pageItem} ${item === page ? styles.pageItemActive : ''}`}
                        onClick={() => onPageChange(item)}
                        aria-label={`Страница ${item + 1}`}
                        aria-current={item === page ? 'page' : undefined}
                    >
                        <svg viewBox="0 0 40 35">
                            <path className={styles.navTrap} d="M10,0 L30,0 L36,7.33 L4,7.33 Z" />
                            <polygon className={styles.navTri} points="4,7.33 36,7.33 20,31.7" />
                            <line className={styles.navDivider} x1="4" y1="7.33" x2="36" y2="7.33" />
                            <text className={styles.pageNumber} x="20" y="14">
                                {item + 1}
                            </text>
                        </svg>
                    </button>
                ),
            )}

            <button
                type="button"
                className={styles.arrowBtn}
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
                aria-label="Следующая страница"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>
            <button
                type="button"
                className={styles.arrowBtn}
                onClick={() => onPageChange(totalPages - 1)}
                disabled={page >= totalPages - 1}
                aria-label="Последняя страница"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                </svg>
            </button>
        </nav>
    );
}

// Страницы (0-based): всегда первые две и последние две, плюс сосед текущей; разрывы — 'ellipsis'.
function buildPageItems(page: number, totalPages: number): Array<number | 'ellipsis'> {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);

    const wanted = new Set<number>([0, 1, totalPages - 2, totalPages - 1, page - 1, page, page + 1]);
    const sorted = [...wanted].filter((p) => p >= 0 && p < totalPages).sort((a, b) => a - b);

    const items: Array<number | 'ellipsis'> = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) items.push('ellipsis');
        items.push(p);
    });
    return items;
}
