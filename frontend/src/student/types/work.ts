// Зеркалит com.aitutor.backend.enums.WorkStatus.
export type WorkStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

// Зеркалит com.aitutor.backend.enums.ItemType.
export type WorkItemType = 'WORD_FORMATION' | 'GAP_FILL' | 'TFNS' | 'MATCHING';

/** Зеркалит com.aitutor.backend.enums.ItemProgressStatus. */
export type ItemProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SOLVED' | 'FAILED';

/** Ответ GET /student/work — карточка работы для списка.
 * Зеркалит com.aitutor.backend.dto.student.StudentWorkResponse. */
export interface StudentWorkListItemResponse {
    id: number;
    taskId: number;
    taskPublicId: string;
    taskName: string;
    status: WorkStatus;
    deadline: string | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    levels?: string[] | null;
    taskTypes?: Array<{ id: number; name: string; description: string | null; isActive: boolean }> | null;
    topics?: Array<{ id: number; name: string }> | null;
    itemTypes?: string[] | null;
    isMixed?: boolean | null;
    /** Количество решённых пунктов. */
    completedItems?: number | null;
    /** Общее количество пунктов. */
    totalItems?: number | null;
}

/** Детальная информация о работе — ответ GET /student/work/{workId}.
 * Зеркалит com.aitutor.backend.dto.student.StudentWorkDetailResponse. */
export interface StudentWorkDetailResponse {
    workId: number;
    taskId: number;
    taskPublicId: string;
    taskName: string;
    status: WorkStatus;
    deadline: string | null;
    startedAt: string | null;
    completedAt: string | null;
    items: StudentTaskItemDto[];
    /** Массив прогресса по каждому пункту — зеркалит StudentItemProgressDto[]. */
    progress: StudentItemProgressDto[];
    /** Уровни CEFR задания (чипы). */
    levels?: string[] | null;
    /** Типы заданий (чипы). */
    taskTypes?: Array<{ id: number; name: string; description: string | null; isActive: boolean }> | null;
    /** Темы (чипы). */
    topics?: Array<{ id: number; name: string }> | null;
    /** Уникальные механики пунктов (чипы). */
    itemTypes?: string[] | null;
    /** Флаг смешанного задания. */
    isMixed?: boolean | null;
}

/** Прогресс по одному пункту — зеркалит com.aitutor.backend.dto.student.StudentItemProgressDto. */
export interface StudentItemProgressDto {
    taskItemId: number;
    status: ItemProgressStatus;
    answerAttempts: number;
    hintsGiven: number;
    hintsRemaining: number;
    lastAnswer: string | null;
}

/** Пункт задания для студента (без correctAnswer). */
export interface StudentTaskItemDto {
    id: number;
    itemType: WorkItemType;
    prompt: string | null;
    content: string | null;
    position: number;
}

/** POST /student/work/{workId}/items/{itemId}/submit — тело запроса. */
export interface StudentSubmitAnswerRequest {
    answer: string;
    hintsUsed?: number;
}

/** Ответ на проверку ответа — POST /student/work/{workId}/items/{itemId}/submit. */
export interface StudentSubmitAnswerResponse {
    taskItemId: number;
    correct: boolean;
    status: WorkStatus;
    attemptsCount: number;
    hintsGiven: number;
    hintsRemaining: number;
    allItemsSolved: boolean;
    /** Подсказка от ИИ (null если ИИ недоступен — free тариф). */
    hint: string | null;
}

/** Результаты работы — ответ GET /student/work/{workId}/summary.
 * Зеркалит com.aitutor.backend.dto.student.StudentWorkSummaryResponse. */
export interface StudentWorkSummaryResponse {
    workId: number;
    taskName?: string;
    status?: WorkStatus;
    startedAt?: string | null;
    completedAt?: string | null;
    durationSeconds?: number | null;
    totalItems: number;
    solvedItems?: number;
    firstTryCorrect: number;
    correctAfterHints: number;
    totalHintsGiven: number;
}
