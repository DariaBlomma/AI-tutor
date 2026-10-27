import type { FormEvent, ReactNode } from 'react';

import { IconTrianglesFrame } from '@/shared/icons';

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
// Треугольный каркас вынесен в shared/icons/IconTrianglesFrame (переиспользуется в профиле).
export function AuthTriangleFormLayout({ onSubmit, button, children }: AuthTriangleFormLayoutProps) {
    return (
        <form className={styles.wrap} onSubmit={onSubmit}>
            <IconTrianglesFrame className={styles.triSvg}/>

            <div className={styles.btnTop}>{button}</div>

            {children}
        </form>
    );
}
