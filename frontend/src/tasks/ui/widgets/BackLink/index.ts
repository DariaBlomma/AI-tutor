export { BackLink } from './BackLink';
export interface BackLinkProps {
    /** Куда возвращаться; по умолчанию — банк заданий. */
    to?: string;
    /** Текст ссылки; по умолчанию — «К банку заданий». */
    label?: string;
}
