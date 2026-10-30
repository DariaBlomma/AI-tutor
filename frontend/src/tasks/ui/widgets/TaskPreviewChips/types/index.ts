import type { CefrLevel, ExamType, GrammarType, ItemType, Topic } from '@/tasks/types';

export interface TaskPreviewChipsProps {
    /** Уровни CEFR задания (пусто = не указаны). */
    levels?: CefrLevel[] | null;
    /** Тип экзамена (OGE/EGE, nullable = не указан). */
    examType?: ExamType | null;
    /** Грамматические типы задания (task_types). */
    grammarTypes: GrammarType[];
    /** Темы задания. */
    topics: Topic[];
    /** Уникальные механики пунктов (ItemType) — подписи берутся из MECHANIC_CHIP_LABELS. */
    itemTypes: ItemType[];
    /** Смешанное ли задание (несколько механик) — жёлтый чип «Mixed». */
    isMixed: boolean;
}
