import type { TaskItemResponseDto } from '@/task/types';

export interface TaskDetailItemProps {
    item: TaskItemResponseDto;
    showAnswers: boolean;
}
