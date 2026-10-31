import { useCallback, useMemo, useState } from 'react';
import { BaseModal } from '@/shared/ui-kit/BaseModal/BaseModal';
import { TaskAssignPopup } from '@/tasks/ui/widgets/TaskAssignPopup/TaskAssignPopup';
import { CourseSelectPopup } from '@/tasks/ui/widgets/CourseSelectPopup/CourseSelectPopup';
import type { BulkAction } from './types';
import type { TaskSummary } from '@/tasks/types';

import styles from './TasksBulkPopup.module.scss';

interface TasksBulkPopupProps {
    action: BulkAction | null;
    /** Выбранные карточки банка (id + name) — для назначения/курса берём taskIds отсюда. */
    selectedTasks: TaskSummary[];
    onClose: () => void;
    /** Успешное назначение из bulk-попапа: виджет закрывает модалку и снимает выбор. */
    onAssigned?: () => void;
    /** Успешное добавление в курс: тот же сценарий закрытия bulk-модалки и снятия выбора. */
    onAddedToCourse?: () => void;
}

// Заголовки модалок по действию bulk-панели.
const POPUP_TITLES: Record<BulkAction, string> = {
    'to-course': 'Добавить в курс',
    assign: 'Назначить задание',
};

// Кнопка-подтверждение: «Назначить» открывает попап учеников (TaskAssignPopup),
// «Добавить» — попап выбора курса (CourseSelectPopup: мультиселект + создание курса).
const POPUP_ACTION_LABELS: Record<BulkAction, string> = {
    'to-course': 'Добавить',
    assign: 'Назначить',
};

// Модалка bulk-действия: заголовок, счётчик выбранных заданий, отмена + кнопка действия.
export function TasksBulkPopup({ action, selectedTasks, onClose, onAssigned, onAddedToCourse }: TasksBulkPopupProps) {
    // Внутренние попапы: выбор учеников (assign) и выбор курса (to-course).
    const [assignOpen, setAssignOpen] = useState(false);
    const [courseOpen, setCourseOpen] = useState(false);

    const openAssignPopup = useCallback(() => setAssignOpen(true), []);
    const openCoursePopup = useCallback(() => setCourseOpen(true), []);

    // Успех назначения: закрываем оба слоя (попап учеников + bulk-модалку) и уведомляем виджет.
    const handleAssigned = useCallback(() => {
        setAssignOpen(false);
        onAssigned?.();
    }, [onAssigned]);

    // Успех добавления в курс: аналогично — снимаем bulk-выбор через родителя.
    const handleAddedToCourse = useCallback(() => {
        setCourseOpen(false);
        onAddedToCourse?.();
    }, [onAddedToCourse]);

    const assignTargets = useMemo(
        () => selectedTasks.map((task) => ({ id: task.id, name: task.name })),
        [selectedTasks],
    );

    const taskIds = useMemo(() => selectedTasks.map((task) => task.id), [selectedTasks]);

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
                    <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCoursePopup}>
                        {action ? POPUP_ACTION_LABELS[action] : ''}
                    </button>
                )}
            </div>

            {/* Тот же попап «Назначить ученику», что на странице просмотра: список своих
                учеников, необязательный дедлайн, отправка POST /api/teacher/assignments. */}
            {action === 'assign' && assignOpen && (
                <TaskAssignPopup open onClose={handleAssigned} tasks={assignTargets} />
            )}

            {/* Попап «Добавить в курс»: мультиселект курсов + создание курса (только название). */}
            {action === 'to-course' && courseOpen && (
                <CourseSelectPopup
                    open
                    onClose={() => setCourseOpen(false)}
                    taskIds={taskIds}
                    tasksHint={`Выбрано заданий: ${taskIds.length}`}
                    onAdded={handleAddedToCourse}
                />
            )}
        </BaseModal>
    );
}
