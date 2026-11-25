import type { TasksBulkAction } from '@/task/types';
import { createPortal } from 'react-dom';

import styles from './TaskBulkActionsBar.module.scss';

interface TaskBulkActionsBarProps {
    selectedCount: number;
    onAction: (action: TasksBulkAction) => void;
    onClose: () => void;
}

// Нижняя панель массовых действий банка заданий (дизайн: fixed над нижним меню,
// по центру, max-width 480). Рендерится виджетом только при выбранном > 0.
export function TaskBulkActionsBar({ selectedCount, onAction, onClose }: TaskBulkActionsBarProps) {
    return createPortal(
        <div className={styles.bar}>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="3" x2="13" y2="13" />
                    <line x1="13" y1="3" x2="3" y2="13" />
                </svg>
            </button>
            <div className={styles.count}>
                Выбрано: <strong>{selectedCount}</strong>
            </div>
            <div className={styles.actions}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => onAction('to-course')}>
                    В курс
                </button>
                <button type="button" className={styles.btn} onClick={() => onAction('assign')}>
                    Назначить
                </button>
            </div>
        </div>,
        document.body,
    );
}
