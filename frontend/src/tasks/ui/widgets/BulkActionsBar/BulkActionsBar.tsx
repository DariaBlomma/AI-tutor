import type { BulkAction } from '@/tasks/ui/widgets/TasksBulkPopup/types';

import styles from './BulkActionsBar.module.scss';

interface BulkActionsBarProps {
    selectedCount: number;
    onAction: (action: BulkAction) => void;
}

// Нижняя панель массовых действий банка заданий (дизайн: fixed над нижним меню,
// по центру, max-width 480). Рендерится виджетом только при выбранном > 0.
export function BulkActionsBar({ selectedCount, onAction }: BulkActionsBarProps) {
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
