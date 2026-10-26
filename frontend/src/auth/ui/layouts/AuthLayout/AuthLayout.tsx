import type { ReactNode } from 'react';

import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
    title: string;
    children: ReactNode;
    // Ссылки-навигация в футере страницы авторизации
    footer?: ReactNode;
    // Дополнительный контент между формой и футером (например, текст успеха)
    notice?: ReactNode;
}

// Единый лэйаут всех страниц авторизации:
// белый заголовок сверху, каркас формы по центру, ссылки внизу.
export function AuthLayout({ title, children, footer, notice }: AuthLayoutProps) {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.content}>
                {children}
                {notice}
            </div>

            {footer && <div className={styles.footerLinks}>{footer}</div>}
        </div>
    );
}
