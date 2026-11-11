import type { TaskItemResponseDto } from '@/tasks/types';

export interface TaskDetailItemProps {
    item: TaskItemResponseDto;
    showAnswers: boolean;
}
