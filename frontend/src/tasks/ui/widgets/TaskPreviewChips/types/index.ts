import type { GrammarType, ItemType, Topic } from '@/tasks/types';

export interface TaskPreviewChipsProps {
    /** Грамматические типы задания (task_types). */
    grammarTypes: GrammarType[];
    /** Темы задания. */
    topics: Topic[];
    /** Уникальные механики пунктов (ItemType) — подписи берутся из MECHANIC_CHIP_LABELS. */
    itemTypes: ItemType[];
    /** Смешанное ли задание (несколько механик) — жёлтый чип «Mixed». */
    isMixed: boolean;
}
