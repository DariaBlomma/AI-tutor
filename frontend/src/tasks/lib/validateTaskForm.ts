import type { ItemType, TaskItemDraft } from '@/tasks/types';
import { ANSWER_MAX_LENGTH, GAP_MARK, TASK_NAME_MAX_LENGTH, TFNS_ANSWERS, isTextRequiredItem } from '@/tasks/data';

export interface TaskFormErrors {
    name?: string;
    text?: string;
    /** id пункта -> текст ошибки (подсветка карточки). */
    items: Record<number, string>;
}

const blank = (value: string): boolean => value.trim().length === 0;

/** Нужен ли заданию текст-материал (tasks.context) — по механике всех пунктов. */
export function needsText(itemType: ItemType): boolean {
    return isTextRequiredItem(itemType);
}

function validateItem(item: TaskItemDraft): string | null {
    switch (item.itemType) {
        case 'WORD_FORMATION':
        case 'GAP_FILL':
            if (blank(item.prompt)) return 'Заполните предложение с пропуском';
            if (!item.prompt.includes(GAP_MARK)) return `В предложении отсутствует маркер пропуска «${GAP_MARK}»`;
            if (blank(item.answer)) return 'Укажите ответ';
            if (item.answer.trim().length > ANSWER_MAX_LENGTH) return `Ответ длиннее ${ANSWER_MAX_LENGTH} символов`;
            if (item.itemType === 'WORD_FORMATION' && blank(item.base)) return 'Укажите слово-базу';
            return null;
        case 'TFNS':
            if (blank(item.prompt)) return 'Введите утверждение';
            // Бэк принимает только TRUE / FALSE / NOT STATED (TaskContentValidator.validateTfns),
            // ответ выбирается чипами — пустой = не выбран.
            if (!TFNS_ANSWERS.includes(item.answer.toUpperCase() as (typeof TFNS_ANSWERS)[number])) {
                return 'Выберите правильный ответ: TRUE, FALSE или NOT STATED';
            }
            return null;
        case 'MATCHING':
            if (blank(item.leftLabel)) return 'Заполните левую часть пары';
            if (blank(item.rightLabel)) return 'Заполните правую часть пары';
            return null;
    }
}

/** Локальная валидация перед POST /api/tasks (зеркалит правила TaskContentValidator). */
export function validateTaskForm(form: {
    name: string;
    grammarTypeIds: number[];
    itemType: ItemType;
    materialText: string;
    items: TaskItemDraft[];
}): TaskFormErrors {
    const errors: TaskFormErrors = { items: {} };

    if (form.name.trim().length > TASK_NAME_MAX_LENGTH) errors.name = `Название не длиннее ${TASK_NAME_MAX_LENGTH} символов`;

    form.items.forEach((item) => {
        const message = validateItem(item);
        if (message) errors.items[item.id] = message;
    });

    if (!form.items.length) {
        errors.text = 'Добавьте хотя бы один пункт задания';
    } else if (needsText(form.itemType) && blank(form.materialText)) {
        errors.text = 'Текст обязателен для TFNS / MATCHING';
    }

    return errors;
}

export function isFormValid(errors: TaskFormErrors, grammarTypesSelected: boolean): boolean {
    return !errors.name && !errors.text && Object.keys(errors.items).length === 0 && grammarTypesSelected;
}
