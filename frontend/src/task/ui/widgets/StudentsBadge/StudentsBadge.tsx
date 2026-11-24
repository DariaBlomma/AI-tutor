import * as Popover from '@radix-ui/react-popover';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getInitials } from '@/shared/utils/getInitials';
import type { TaskAssignmentDto } from '@/task/types';
import styles from './StudentsBadge.module.scss';

export interface StudentsBadgeProps {
    /** Количество активных назначений. */
    count: number;
    /** Список учеников с активными назначениями. */
    assignments?: TaskAssignmentDto[] | null;
    /** Флаг загрузки списка. */
    isLoading?: boolean;
}

/**
 * Компонент-бейдж: иконка людей + число активных назначений.
 * На десктопе — попап по hover, на мобильном — по клику.
 */
export function StudentsBadge({ count, assignments, isLoading }: StudentsBadgeProps) {
    const [open, setOpen] = useState(false);
    const hoverRef = useRef<HTMLButtonElement>(null);

    // Hover-логика для десктопа: открываем при mouseEnter, закрываем с задержкой при mouseLeave
    useEffect(() => {
        const el = hoverRef.current;
        if (!el) return;

        let timeout: ReturnType<typeof setTimeout>;

        const show = () => {
            clearTimeout(timeout);
            setOpen(true);
        };

        const hide = () => {
            timeout = setTimeout(() => setOpen(false), 150);
        };

        el.addEventListener('mouseenter', show);
        el.addEventListener('mouseleave', hide);

        return () => {
            clearTimeout(timeout);
            el.removeEventListener('mouseenter', show);
            el.removeEventListener('mouseleave', hide);
        };
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        // На мобильных — toggle по клику, на десктопе — клик перебивает hover
        setOpen((prev) => !prev);
    }, []);

    if (count <= 0) {
        return null;
    }

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    ref={hoverRef}
                    type="button"
                    className={styles.badge}
                    onClick={handleClick}
                    aria-label={`Назначено ${count} ученикам`}
                >
                    <svg
                        className={styles.icon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className={styles.count}>{count}</span>
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className={styles.popup}
                    side="bottom"
                    align="start"
                    sideOffset={8}
                    collisionPadding={12}
                >
                    <div className={styles.popupTitle}>Назначено ученикам</div>

                    {isLoading && <div className={styles.popupLoading}>Загрузка…</div>}

                    {!isLoading && assignments && assignments.length > 0 && (
                        <ul className={styles.studentList}>
                            {assignments.map((student) => (
                                <li key={student.studentId} className={styles.studentItem}>
                                    <div className={styles.studentAvatar}>
                                        {getInitials([student.studentName, student.lastName].filter(Boolean).join(' '))}
                                    </div>
                                    <span className={styles.studentName}>
                                        {student.studentName}
                                        {student.lastName && ` ${student.lastName}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {!isLoading && (!assignments || assignments.length === 0) && (
                        <div className={styles.popupEmpty}>Нет активных назначений</div>
                    )}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
