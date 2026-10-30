import type { GapFillContentDto, MatchingContentDto, TaskContextDto, WordFormationContentDto } from '@/tasks/types';

// Разбор JSON-полей детальной карточки задания (TaskResponse.context / TaskItemResponse.content).
// Бэк хранит их как TEXT с JSON — на фронте приводим к типизированным DTO; битый JSON
// (или не-объект) молча превращаем в null, чтобы просмотр задания не падал из-за данных.

/** tasks.context -> TaskContextDto | null (пусто/битый JSON -> null). */
export function parseTaskContext(json: string | null): TaskContextDto | null {
    const parsed = parseJsonObject(json);
    if (!parsed || typeof parsed.text !== 'string') return null;
    const context: TaskContextDto = { type: 'TEXT', text: parsed.text };
    if (typeof parsed.title === 'string' && parsed.title.trim()) context.title = parsed.title;
    return context;
}

/** task_items.content для WORD_FORMATION: слово-база + пояснение. */
export function parseWordFormationContent(json: string | null): WordFormationContentDto | null {
    return parseJsonObject(json) as WordFormationContentDto | null;
}

/** task_items.content для GAP_FILL: подсказка-опции + пояснение. */
export function parseGapFillContent(json: string | null): GapFillContentDto | null {
    return parseJsonObject(json) as GapFillContentDto | null;
}

/** task_items.content для MATCHING: левая/правая части пары + пояснение. */
export function parseMatchingContent(json: string | null): MatchingContentDto | null {
    return parseJsonObject(json) as MatchingContentDto | null;
}

/** Пояснение к пункту (content.explanation) — есть у всех механик, необязательное. */
export function parseExplanation(json: string | null): string | null {
    const content = parseJsonObject(json);
    return typeof content?.explanation === 'string' && content.explanation.trim() ? content.explanation : null;
}

function parseJsonObject(json: string | null): Record<string, unknown> | null {
    if (!json || !json.trim()) return null;
    try {
        const parsed: unknown = JSON.parse(json);
        return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
    } catch {
        return null;
    }
}
