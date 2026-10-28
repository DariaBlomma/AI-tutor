// Типы модуля «Банк заданий» — зеркалят DTO бэкенда
// (com.aitutor.backend.dto.task / topic / tasktype).

/** com.aitutor.backend.enums.ItemType — механика пункта задания. */
export type ItemType = 'WORD_FORMATION' | 'GAP_FILL' | 'TFNS' | 'MATCHING';

/** Формат материала задания (tasks.context.type). AUDIO пока недоступен на фронте. */
export type MaterialFormat = 'TEXT' | 'AUDIO';

/** GET /api/topics -> TopicResponse. */
export interface Topic {
    id: number;
    name: string;
}

/** GET /api/task-types -> TaskTypeResponse. */
export interface TaskType {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
}

/** GET /api/tasks -> TaskSummaryResponse (лёгкая карточка банка, без контента). */
export interface TaskSummary {
    id: number;
    publicId: string;
    name: string;
    previewText: string | null;
    isMixed: boolean;
    topics: Topic[];
    taskTypes: TaskType[];
    itemCount: number;
    createdAt: string;
}

/**
 * tasks.context — JSON-материал задания (см. backend README «Формат контента заданий»):
 * TEXT требует text, AUDIO требует url, title — необязательная подпись.
 */
export interface TaskContextDto {
    type: MaterialFormat;
    title?: string;
    text?: string;
    url?: string;
}

/** task_items.content для WORD_FORMATION: base + explanation. */
export interface WordFormationContentDto {
    base?: string;
    explanation?: string;
}

/** task_items.content для GAP_FILL: options + explanation. */
export interface GapFillContentDto {
    options?: string[];
    explanation?: string;
}

/** task_items.content для TFNS: только explanation. */
export interface TfnsContentDto {
    explanation?: string;
}

/** task_items.content для MATCHING (одна пара = один пункт). */
export interface MatchingContentDto {
    left_label?: string;
    right_label?: string;
    explanation?: string;
}

/** POST /api/tasks -> TaskItemRequest. content — JSON-строка по схеме ItemType. */
export interface TaskItemRequestDto {
    itemType: ItemType;
    prompt?: string | null;
    correctAnswer?: string | null;
    content?: string | null;
}

/** POST /api/tasks -> TaskCreateRequest. */
export interface TaskCreateRequestDto {
    name: string;
    context?: string | null;
    items: TaskItemRequestDto[];
    topicIds?: number[];
    taskTypeIds: number[];
}

/** POST/PUT /api/topics -> TopicRequest. */
export interface RefNameRequestDto {
    name: string;
}

/** POST/PUT /api/task-types -> TaskTypeRequest (description до 1000 символов). */
export interface TaskTypeRequestDto {
    name: string;
    description?: string | null;
}

/** GET/POST /api/tasks/{id} -> TaskResponse (полная карточка; на фронте — ответ создания). */
export interface TaskResponseDto {
    id: number;
    publicId: string;
    name: string;
    previewText: string | null;
    context: string | null;
    isMixed: boolean;
    topics: Topic[];
    taskTypes: TaskType[];
    items: TaskItemResponseDto[];
    createdAt: string;
}

/** TaskItemResponse из состава TaskResponse. */
export interface TaskItemResponseDto {
    id: number;
    itemType: ItemType;
    prompt: string | null;
    correctAnswer: string | null;
    content: string | null;
    position: number;
}
