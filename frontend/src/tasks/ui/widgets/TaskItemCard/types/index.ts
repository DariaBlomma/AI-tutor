import type { TaskItemDraft } from '@/tasks/types';

export interface TaskItemCardProps {
    item: TaskItemDraft;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    /** Текст ошибки валидации пункта (подсветка карточки), если есть. */
    error?: string;
    onChange: (id: number, patch: Partial<TaskItemDraft>) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onRemove: (index: number) => void;
}
