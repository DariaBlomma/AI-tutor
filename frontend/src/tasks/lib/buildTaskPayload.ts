import type {
    GapFillContentDto,
    ItemType,
    MatchingContentDto,
    TaskContextDto,
    TaskCreateRequestDto,
    TaskItemDraft,
    TaskItemRequestDto,
    TfnsContentDto,
    WordFormationContentDto,
} from '@/tasks/types';
import { needsText } from './validateTaskForm';

const blank = (value: string): boolean => value.trim().length === 0;
const orNull = (value: string): string | null => (blank(value) ? null : value.trim());

// content отправляется только если хотя бы одно поле заполнено —
// пустой объект бэк отвергает (неизвестных полей нет, но base обязателен).
function buildItemContent(item: TaskItemDraft): string | null {
    let content: Record<string, unknown> | WordFormationContentDto | GapFillContentDto | TfnsContentDto | MatchingContentDto | null = null;

    switch (item.itemType) {
        case 'WORD_FORMATION': {
            const dto: WordFormationContentDto = {};
            if (!blank(item.base)) dto.base = item.base.trim();
            if (!blank(item.explanation)) dto.explanation = item.explanation.trim();
            content = dto;
            break;
        }
        case 'GAP_FILL': {
            const dto: GapFillContentDto = {};
            const options = item.options
                .split(',')
                .map((option) => option.trim())
                .filter(Boolean);
            if (options.length) dto.options = options;
            if (!blank(item.explanation)) dto.explanation = item.explanation.trim();
            content = dto;
            break;
        }
        case 'TFNS': {
            const dto: TfnsContentDto = {};
            if (!blank(item.explanation)) dto.explanation = item.explanation.trim();
            content = dto;
            break;
        }
        case 'MATCHING': {
            const dto: MatchingContentDto = {};
            if (!blank(item.leftLabel)) dto.left_label = item.leftLabel.trim();
            if (!blank(item.rightLabel)) dto.right_label = item.rightLabel.trim();
            if (!blank(item.explanation)) dto.explanation = item.explanation.trim();
            content = dto;
            break;
        }
    }

    const hasValue = content !== null && Object.values(content as Record<string, unknown>).some((v) => v !== undefined);
    return hasValue ? JSON.stringify(content) : null;
}

function buildItemRequest(item: TaskItemDraft): TaskItemRequestDto {
    // MATCHING: prompt не используется (подсказок в UI нет), correctAnswer запрещён бэком.
    if (item.itemType === 'MATCHING') {
        return {
            itemType: item.itemType,
            prompt: null,
            correctAnswer: null,
            content: buildItemContent(item),
        };
    }
    return {
        itemType: item.itemType,
        prompt: orNull(item.prompt),
        // TFNS: канонический вид TRUE / FALSE / NOT STATED (валидатор бэка приводит к upper).
        correctAnswer: item.itemType === 'TFNS' ? (item.tfnsAnswer.toUpperCase() || null) : orNull(item.answer),
        content: buildItemContent(item),
    };
}

/**
 * Сборка TaskCreateRequest из состояния конструктора.
 * Текст-материал (context) сериализуется только если он нужен для выбранной механики
 * (TFNS/MATCHING); требования к пунктам ловит локальная валидация (см. validateTaskForm).
 */
export function buildTaskPayload(form: {
    name: string;
    topicIds: number[];
    grammarTypeIds: number[];
    itemType: ItemType;
    materialTitle: string;
    materialText: string;
    items: TaskItemDraft[];
}): TaskCreateRequestDto {
    let context: string | null = null;
    if (needsText(form.itemType)) {
        const dto: TaskContextDto = { type: 'TEXT', text: form.materialText.trim() };
        if (!blank(form.materialTitle)) dto.title = form.materialTitle.trim();
        context = JSON.stringify(dto);
    }

    return {
        // Название необязательное: пустая строка -> null (бэк допускает tasks.name = NULL).
        name: orNull(form.name),
        context,
        items: form.items.map(buildItemRequest),
        topicIds: form.topicIds,
        // Имя поля DTO бэкенда (TaskCreateRequest.taskTypeIds) не меняем — только фронтенд-именование.
        taskTypeIds: form.grammarTypeIds,
    };
}
