// Типы модуля «Банк заданий» — зеркалят DTO бэкенда
// (com.aitutor.backend.dto.task / topic / tasktype).

/** com.aitutor.backend.enums.ItemType — механика пункта задания. */
export type ItemType = 'WORD_FORMATION' | 'GAP_FILL' | 'TFNS' | 'MATCHING';

/**
 * Формат материала задания (tasks.context.type).
 * БЭК формально допускает AUDIO (TaskContentValidator: type=AUDIO требует url), но загрузка
 * аудио не реализована ни на бэке, ни на фронте — на UI поддерживается только TEXT.
 */
export type MaterialFormat = 'TEXT';

/** GET /api/topics -> TopicResponse. */
export interface Topic {
    id: number;
    name: string;
}

/** GET /api/task-types -> TaskTypeResponse. */
export interface GrammarType {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
}

/** Spring Page<T> — ответ GET /api/tasks с пагинацией. */
export interface PageDto<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // текущая страница (0-based)
    size: number;
}

/** Параметры GET /api/tasks. topicId — фильтр на фронте (на бэке эндпоинта нет). */
export interface TasksQueryParams {
    search?: string;
    /** Имя query-параметра бэкенда GET /api/tasks. */
    taskTypeId?: number;
    itemType?: ItemType;
    includeMixed?: boolean;
    page?: number;
    size?: number;
}

/** Механики пунктов (enum ItemType) с подписями для фильтра банка заданий. */
export const ITEM_TYPE_OPTIONS: Array<{ value: ItemType; label: string }> = [
    { value: 'WORD_FORMATION', label: 'Словообразование' },
    { value: 'GAP_FILL', label: 'Gap fill' },
    { value: 'TFNS', label: 'True / False / Not stated' },
    { value: 'MATCHING', label: 'Matching' },
];

/** GET /api/tasks -> TaskSummaryResponse (лёгкая карточка банка, без контента). */
export interface TaskSummary {
    id: number;
    publicId: string;
    /** Необязательное на бэке (миграция 017) — без названия показываем публичный id. */
    name: string | null;
    previewText: string | null;
    isMixed: boolean;
    topics: Topic[];
    /** JSON-поле бэкенда TaskSummaryResponse.taskTypes (фронтенд-именование — grammarTypes). */
    taskTypes: GrammarType[];
    itemCount: number;
    createdAt: string;
}

/** task_types — на бэке это сущность, а не enum. Механики пунктов (ItemType) фиксированы. */

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
    /** Необязательное: бэк допускает null (миграция 017-tasks-name-nullable). */
    name: string | null;
    /** Необязательная инструкция для ученика (миграция 018), есть у любого типа заданий. */
    instruction?: string | null;
    context?: string | null;
    items: TaskItemRequestDto[];
    topicIds?: number[];
    /** Имя поля бэкенда TaskCreateRequest — не переименовывается. */
    taskTypeIds: number[];
}

/** POST/PUT /api/topics -> TopicRequest. */
export interface RefNameRequestDto {
    name: string;
}

/** POST/PUT /api/task-types -> TaskTypeRequest (description до 1000 символов). */
export interface GrammarTypeRequestDto {
    name: string;
    description?: string | null;
}

/** GET/POST /api/tasks/{id} -> TaskResponse (полная карточка; на фронте — ответ создания). */
export interface TaskResponseDto {
    id: number;
    publicId: string;
    name: string;
    previewText: string | null;
    /** Инструкция для ученика; null = не заполнена (поле необязательное). */
    instruction: string | null;
    context: string | null;
    isMixed: boolean;
    topics: Topic[];
    /** JSON-поле бэкенда TaskResponse.taskTypes. */
    taskTypes: GrammarType[];
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
