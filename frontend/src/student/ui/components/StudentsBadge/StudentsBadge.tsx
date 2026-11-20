import { useCallback, useEffect, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { getInitials } from '@/shared/utils/getInitials';
import { useTaskAssignments } from '@/tasks/hooks/useTaskAssignments';
import type { StudentsBadgeProps } from './StudentsBadge.types';
import styles from './StudentsBadge.module.scss';

// SVG-иконка людей (Radix-style, stroke-based).
function IconUsers({ className, width = 16, height = 16 }: { className?: string; width?: number; height?: number }) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function StudentsBadge({ taskId, count }: StudentsBadgeProps) {
    const { assignments, isLoading } = useTaskAssignments(taskId);
    const [isOpen, setIsOpen] = useState(false);
    const badgeRef = useRef<HTMLButtonElement>(null);

    // Закрытие попапа при клике вне — для мобильной fallback-логики.
    const handleOutsideClick = useCallback(() => {
        setIsOpen(false);
    }, []);

    // На мобильных — toggle по клику, на десктопе — hover через CSS.
    const handleClick = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return (
        <Popover.Root open={isOpen} onOpenChange={(next) => {
            setIsOpen(next);
            if (!next) handleOutsideClick();
        }}>
            <Popover.Trigger asChild>
                <button
                    ref={badgeRef}
                    type="button"
                    className={styles.badge}
                    onClick={handleClick}
                    aria-label={`Назначено ${count ?? 0} ученикам`}
                >
                    <IconUsers className={styles.icon} />
                    {count != null && count > 0 && <span className={styles.count}>{count}</span>}
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    className={styles.popup}
                    side="top"
                    align="end"
                    sideOffset={8}
                    collisionPadding={12}
                    onFocusOutside={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                        // Закрываем только если клик вне badge и попапа.
                        const target = e.target as HTMLElement;
                        if (!target.closest(`.${styles.badge}`)) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <div className={styles.popupContent}>
                        <div className={styles.popupTitle}>Назначено ученикам</div>
                        {isLoading ? (
                            <div className={styles.popupLoading}>Загрузка…</div>
                        ) : !assignments || assignments.length === 0 ? (
                            <div className={styles.popupEmpty}>Нет назначений</div>
                        ) : (
                            <div className={styles.studentList}>
                                {assignments.map((a) => (
                                    <div key={a.studentId} className={styles.studentItem}>
                                        <div className={styles.studentAvatar}>
                                            {getInitials(a.studentName, a.lastName)}
                                        </div>
                                        <div className={styles.studentName}>
                                            {a.studentName}
                                            {a.lastName && <span className={styles.lastName}> {a.lastName}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
