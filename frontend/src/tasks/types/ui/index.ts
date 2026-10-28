import type { ItemType } from '../models';

/** Метаданные механики пункта для селекта типов. */
export interface ItemTypeInfo {
    value: ItemType;
    label: string;
}

/** Локальное состояние одного пункта в конструкторе (до сборки payload). */
export interface TaskItemDraft {
    id: number;
    /** Механика задаётся выбором типа на уровне задания (ItemTypeSelect), но хранится в пункте —
     *  бэк принимает ItemType у каждого item (см. TaskItemRequest). */
    itemType: ItemType;
    /** Предложение с пропуском ___ (WORD_FORMATION/GAP_FILL) или утверждение (TFNS). */
    prompt: string;
    /** Ответ/эталон (WORD_FORMATION/GAP_FILL — вписываемое слово; TFNS — TRUE/FALSE/NOT STATED);
     *  не используется для MATCHING. */
    answer: string;
    /** WORD_FORMATION: слово-база из скобок. */
    base: string;
    /** GAP_FILL: необязательные опции-подсказки через запятую (content.options). */
    options: string;
    /** MATCHING: левая и правая части пары. */
    leftLabel: string;
    rightLabel: string;
    /** Пояснение ко всем типам. */
    explanation: string;
}
