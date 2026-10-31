import { useCallback, useMemo, useState } from 'react';
import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import { TaskAssignPopup } from '@/tasks/ui/widgets/TaskAssignPopup/TaskAssignPopup';
import type { BulkAction } from './types';
import type { TaskSummary } from '@/tasks/types';

import styles from './TasksBulkPopup.module.scss';

interface TasksBulkPopupProps {
    action: BulkAction | null;
    /** Выбранные карточки банка (id + name) — для назначения берём taskIds отсюда. */
    selectedTasks: TaskSummary[];
    onClose: () => void;
    /** Успешное назначение из bulk-попапа: виджет закрывает модалку и снимает выбор. */
    onAssigned?: () => void;
}

// Заголовки модалок по действию bulk-панели.
const POPUP_TITLES: Record<BulkAction, string> = {
    'to-course': 'Добавить в курс',
    assign: 'Назначить задание',
};

// Кнопка-подтверждение для «Добавить в курс»: API массового добавления в курс ещё нет —
// действие остаётся заглушкой. Назначение («assign») работает через общий попап
// TaskAssignPopup — то же поведение, что на странице просмотра задания.
const POPUP_ACTION_LABELS: Record<BulkAction, string> = {
    'to-course': 'Добавить',
    assign: 'Назначить',
};

// Модалка bulk-действия: заголовок, счётчик выбранных заданий, отмена + кнопка действия.
export function TasksBulkPopup({ action, selectedTasks, onClose, onAssigned }: TasksBulkPopupProps) {
    // Внутренний попап выбора учеников (открывается кнопкой «Назначить»).
    const [assignOpen, setAssignOpen] = useState(false);

    const openAssignPopup = useCallback(() => setAssignOpen(true), []);
    // Успех назначения: закрываем оба слоя (попап учеников + bulk-модалку) и уведомляем виджет.
    const handleAssigned = useCallback(() => {
        setAssignOpen(false);
        onAssigned?.();
    }, [onAssigned]);

    const assignTargets = useMemo(
        () => selectedTasks.map((task) => ({ id: task.id, name: task.name })),
        [selectedTasks],
    );

    return (
        <BaseModal open={action !== null} onClose={onClose} title={action ? POPUP_TITLES[action] : ''}>
            <div className={styles.info}>Выбрано заданий: <strong>{selectedTasks.length}</strong></div>
            <div className={styles.actions}>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                    Отмена
                </button>
                {action === 'assign' ? (
                    <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={openAssignPopup}>
                        {POPUP_ACTION_LABELS.assign}
                    </button>
                ) : (
                    // TODO: реализовать onClick после появления API массового добавления в курс.
                    <button type="button" className={`${styles.btn} ${styles.btnPrimary}`}>
                        {action ? POPUP_ACTION_LABELS[action] : ''}
                    </button>
                )}
            </div>

            {/* Тот же попап «Назначить ученику», что на странице просмотра: список своих
                учеников, необязательный дедлайн, отправка POST /api/teacher/assignments. */}
            {action === 'assign' && assignOpen && (
                <TaskAssignPopup open onClose={handleAssigned} tasks={assignTargets} />
            )}
        </BaseModal>
    );
}
