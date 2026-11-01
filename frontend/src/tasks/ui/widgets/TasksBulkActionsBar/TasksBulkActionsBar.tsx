import type { TasksBulkAction } from '@/tasks/types';

import styles from './TasksBulkActionsBar.module.scss';

interface TasksBulkActionsBarProps {
    selectedCount: number;
    onAction: (action: TasksBulkAction) => void;
}

// Нижняя панель массовых действий банка заданий (дизайн: fixed над нижним меню,
// по центру, max-width 480). Рендерится виджетом только при выбранном > 0.
export function TasksBulkActionsBar({ selectedCount, onAction }: TasksBulkActionsBarProps) {
    return (
        <div className={styles.bar}>
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
        </div>
    );
}
