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
    /** Уровни CEFR (enum CefrLevel) — серверный фильтр (минимум один с миграции 021). */
    levels?: CefrLevel;
    /** Тип экзамена (enum ExamType: OGE/EGE) — серверный фильтр. */
    examType?: ExamType;
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

/** com.aitutor.backend.enums.CefrLevel — уровень CEFR задания (фильтр банка заданий). */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/** Варианты уровня языка для фильтра (enum CefrLevel; подписи = сами значения). */
export const CEFR_LEVEL_OPTIONS: Array<{ value: CefrLevel; label: string }> = [
    { value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'C1', label: 'C1' },
];

/** com.aitutor.backend.enums.ExamType — тип экзамена (закрытый enum: сейчас ОГЭ и ЕГЭ). */
export type ExamType = 'OGE' | 'EGE';

/** Варианты экзамена для фильтра (enum ExamType) с подписями для UI. */
export const EXAM_TYPE_OPTIONS: Array<{ value: ExamType; label: string }> = [
    { value: 'OGE', label: 'ОГЭ' },
    { value: 'EGE', label: 'ЕГЭ' },
];

/** GET /api/tasks -> TaskSummaryResponse (лёгкая карточка банка, без контента). */
export interface TaskSummary {
    id: number;
    publicId: string;
    /** Необязательное на бэке (миграция 017) — без названия показываем заглушку «Без названия». */
    name: string | null;
    previewText: string | null;
    isMixed: boolean;
    /** Уровни CEFR задания (пусто = не указаны, старые данные до заполнения). */
    levels?: CefrLevel[] | null;
    /** Тип экзамена (OGE/EGE); null = не указан. */
    examType?: ExamType | null;
    topics: Topic[];
    /** JSON-поле бэкенда TaskSummaryResponse.taskTypes (фронтенд-именование — grammarTypes). */
    taskTypes: GrammarType[];
    itemCount: number;
    createdAt: string;
    /** Уникальные механики пунктов задания (чипы в карточке). */
    itemTypes?: ItemType[];
    /** Автор задания — действия (удаление) доступны только владельцу. */
    createdById?: number | null;
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

/** Подписи механик пунктов (enum ItemType) — короткие чипы в карточке банка и на просмотре задания. */
export const MECHANIC_CHIP_LABELS: Record<ItemType, string> = {
    WORD_FORMATION: 'word formation',
    GAP_FILL: 'gap fill',
    TFNS: 'TFNS',
    MATCHING: 'matching',
};

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
    /** Уровни CEFR (enum CefrLevel): минимум один — как на бэке (@NotEmpty). */
    levels: CefrLevel[];
    /** Необязательный тип экзамена (enum ExamType: OGE/EGE). */
    examType?: ExamType | null;
    items: TaskItemRequestDto[];
    topicIds?: number[];
    /** Имя поля бэкенда TaskCreateRequest — не переименовывается. */
    taskTypeIds: number[];
}

/** PUT /api/tasks/{id} -> TaskUpdateRequest (com.aitutor.backend.dto.task.TaskUpdateRequest). */
export interface TaskUpdateRequestDto {
    name: string | null;
    instruction?: string | null;
    context?: string | null;
    /** Полный список пунктов: отсутствующие в запросе удаляются на бэке (orphanRemoval). */
    items: TaskItemRequestDto[];
    levels: CefrLevel[];
    examType?: ExamType | null;
    topicIds?: number[];
    taskTypeIds: number[];
}

/** GET /api/tasks/by-public-id/{publicId}/usage -> TaskUsageResponse (факт использования задания учениками). */
export interface TaskUsageDto {
    /** Есть незавершённые назначения (ASSIGNED / IN_PROGRESS). */
    hasActiveAssignments: boolean;
    /** Есть сдачи (COMPLETED), в том числе по ранее удалённым назначениям. */
    hasSubmissions: boolean;
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
    /** Уровни CEFR задания (пусто = не заполнены). */
    levels?: CefrLevel[] | null;
    /** Тип экзамена (OGE/EGE); null = не заполнен. */
    examType?: ExamType | null;
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
