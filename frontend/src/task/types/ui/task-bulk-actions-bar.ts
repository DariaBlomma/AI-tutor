import type { TasksBulkAction } from '@/task/types';

export interface TaskBulkActionsBarProps {
    selectedCount: number;
    onAction: (action: TasksBulkAction) => void;
    onClose: () => void;
}
