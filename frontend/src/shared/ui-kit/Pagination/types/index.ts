/** Пропсы переиспользуемой пагинации (дизайн: страницы-«треугольники» + стрелки). */
export interface PaginationProps {
    /** Текущая страница, 0-based. */
    page: number;
    /** Всего страниц (из серверного ответа). */
    totalPages: number;
    /** Колбэк смены страницы (0-based). */
    onPageChange: (page: number) => void;
}
