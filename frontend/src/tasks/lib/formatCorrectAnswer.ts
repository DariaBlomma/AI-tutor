import type { TaskItemResponseDto } from '@/tasks/types';
import { parseMatchingContent } from './parseTaskContent';

/**
 * Человекочитаемый правильный ответ пункта задания.
 * У MATCHING нет correctAnswer на бэке — собираем из content.
 */
export function formatCorrectAnswer(item: TaskItemResponseDto): string {
    if (item.correctAnswer) return item.correctAnswer;
    if (item.itemType === 'MATCHING') {
        const pair = parseMatchingContent(item.content);
        if (pair?.left_label) return `${pair.left_label} → ${pair.right_label ?? ''}`;
    }
    return '—';
}
