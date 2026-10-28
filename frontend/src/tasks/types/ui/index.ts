import type { ItemType } from '../models';

/** Метаданные механики пункта для селекта типов. */
export interface ItemTypeInfo {
    value: ItemType;
    label: string;
}

/** Локальное состояние одного пункта в конструкторе (до сборки payload). */
export interface TaskItemDraft {
    id: number;
    itemType: ItemType;
    /** Предложение с пропуском ___ (WORD_FORMATION/GAP_FILL) или утверждение (TFNS). */
    prompt: string;
    /** Ответ/эталон; не используется для MATCHING. */
    answer: string;
    /** WORD_FORMATION: слово-база из скобок. */
    base: string;
    /** GAP_FILL: варианты выбора через запятую. */
    options: string;
    /** TFNS/MATCHING: подсказка/prompt. */
    hint: string;
    /** MATCHING: левая и правая части пары. */
    leftLabel: string;
    rightLabel: string;
    /** Пояснение ко всем типам. */
    explanation: string;
}
