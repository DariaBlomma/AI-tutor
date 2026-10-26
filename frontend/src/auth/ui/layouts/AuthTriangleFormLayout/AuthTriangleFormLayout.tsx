import type { FormEvent, ReactNode } from 'react';

import styles from './AuthTriangleFormLayout.module.scss';

interface AuthTriangleFormLayoutProps {
    onSubmit: (e: FormEvent) => void;
    // Кнопка-трапеция над верхним треугольником
    button: ReactNode;
    children: ReactNode;
}

// Каркас форм авторизации по мотивам страницы логина:
// SVG с двумя треугольниками (вершины смотрят друг на друга),
// кнопка-трапеция над верхним треугольником, поля — внутри треугольников.
export function AuthTriangleFormLayout({ onSubmit, button, children }: AuthTriangleFormLayoutProps) {
    return (
        <form className={styles.wrap} onSubmit={onSubmit}>
            <svg className={styles.triSvg} viewBox="0 0 320 480" aria-hidden="true">
                <polygon className={styles.triPath} points="160,260 20,40 300,40" />
                <polygon className={styles.triPath} points="160,260 300,480 20,480" />
            </svg>

            <div className={styles.btnTop}>{button}</div>

            {children}
        </form>
    );
}
