import type { ItemTypeInfo, ItemType } from '@/tasks/types';

// Максимумы, зеркалящие валидацию бэка (TaskCreateRequest / TaskContentValidator).
export const TASK_NAME_MAX_LENGTH = 200;
export const ANSWER_MAX_LENGTH = 200;
export const REF_NAME_MAX_LENGTH = 100; // topics/task-types name @Size(max=100)

// Маркер пропуска в prompt для WORD_FORMATION/GAP_FILL.
export const GAP_MARK = '___';

// Механики пунктов — enum ItemType бэка (TaskContentValidator).
export const ITEM_TYPES: ItemTypeInfo[] = [
    { value: 'WORD_FORMATION', label: 'Словообразование' },
    { value: 'GAP_FILL', label: 'Gap fill (пропуск из вариантов)' },
    { value: 'TFNS', label: 'True / False / Not stated' },
    { value: 'MATCHING', label: 'Сопоставление пар' },
];

/** Типы, для которых бэк требует tasks.context с текстом (validateContext). */
export const TEXT_REQUIRED_ITEM_TYPES: ItemType[] = ['TFNS', 'MATCHING'];

export function isTextRequiredItem(itemType: ItemType): boolean {
    return TEXT_REQUIRED_ITEM_TYPES.includes(itemType);
}

// Варианты правильного ответа TFNS (бэк принимает только их в correctAnswer).
export const TFNS_ANSWERS = ['TRUE', 'FALSE', 'NOT STATED'] as const;
