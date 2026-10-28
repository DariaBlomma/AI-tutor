import type { TaskItemDraft } from '@/tasks/types';
import { ANSWER_MAX_LENGTH, GAP_MARK, TASK_NAME_MAX_LENGTH } from '@/tasks/data';

export interface TaskFormErrors {
    name?: string;
    material?: string;
    /** id пункта -> текст ошибки (подсветка карточки). */
    items: Record<number, string>;
}

const blank = (value: string): boolean => value.trim().length === 0;

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
            if (blank(item.answer)) return 'Выберите правильный ответ';
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
    materialText: string;
    items: TaskItemDraft[];
}): TaskFormErrors {
    const errors: TaskFormErrors = { items: {} };

    if (blank(form.name)) errors.name = 'Название задания обязательно';
    else if (form.name.trim().length > TASK_NAME_MAX_LENGTH) errors.name = `Название не длиннее ${TASK_NAME_MAX_LENGTH} символов`;

    form.items.forEach((item) => {
        const message = validateItem(item);
        if (message) errors.items[item.id] = message;
    });

    const needsMaterial = form.items.some(
        (item) => item.itemType === 'TFNS' || item.itemType === 'MATCHING',
    );
    if (needsMaterial && blank(form.materialText)) {
        errors.material = 'Материал (текст) обязателен для TFNS / MATCHING';
    }

    if (!form.items.length) errors.material = errors.material ?? 'Добавьте хотя бы один пункт задания';

    return errors;
}

export function isFormValid(errors: TaskFormErrors, grammarTypesSelected: boolean): boolean {
    return !errors.name && !errors.material && Object.keys(errors.items).length === 0 && grammarTypesSelected;
}
