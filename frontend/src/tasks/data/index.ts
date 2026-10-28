import type { ItemTypeInfo } from '@/tasks/types';

// Максимумы, зеркалящие валидацию бэка (TaskCreateRequest / TaskContentValidator).
export const TASK_NAME_MAX_LENGTH = 200;
export const ANSWER_MAX_LENGTH = 200;
export const REF_NAME_MAX_LENGTH = 100; // topics/task-types name @Size(max=100)

// Маркер пропуска в prompt для WORD_FORMATION/GAP_FILL.
export const GAP_MARK = '___';

// Механики пунктов — enum ItemType бэка (TaskContentValidator).
export const ITEM_TYPES: ItemTypeInfo[] = [
    { value: 'WORD_FORMATION', label: 'WORD_FORMATION — Словообразование' },
    { value: 'GAP_FILL', label: 'GAP_FILL — Грамматический пропуск' },
    { value: 'TFNS', label: 'TFNS — True / False / Not stated' },
    { value: 'MATCHING', label: 'MATCHING — Сопоставление пар' },
];

// Варианты правильного ответа TFNS (бэк принимает только их в correctAnswer).
export const TFNS_ANSWERS = ['TRUE', 'FALSE', 'NOT STATED'] as const;
