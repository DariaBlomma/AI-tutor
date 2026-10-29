import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import type { BulkAction } from './types';

import styles from './TasksBulkPopup.module.scss';

interface TasksBulkPopupProps {
    action: BulkAction | null;
    selectedCount: number;
    onClose: () => void;
}

// Заголовки модалок по действию bulk-панели.
const POPUP_TITLES: Record<BulkAction, string> = {
    'to-course': 'Добавить в курс',
    assign: 'Назначить задание',
};

// Кнопки-подтверждения внутри модалки — без обработчиков: API курсов/назначений ещё нет.
const POPUP_ACTION_LABELS: Record<BulkAction, string> = {
    'to-course': 'Добавить',
    assign: 'Назначить',
};

// Модалка bulk-действия: заголовок, счётчик выбранных заданий, отмена + кнопка действия.
export function TasksBulkPopup({ action, selectedCount, onClose }: TasksBulkPopupProps) {
    return (
        <BaseModal open={action !== null} onClose={onClose} title={action ? POPUP_TITLES[action] : ''}>
            <div className={styles.info}>Выбрано заданий: <strong>{selectedCount}</strong></div>
            <div className={styles.actions}>
                {/* TODO: реализовать onClick после появления API добавления в курс / назначения. */}
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                    Отмена
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
                    {action ? POPUP_ACTION_LABELS[action] : ''}
                </button>
            </div>
        </BaseModal>
    );
}
