// Контракты бэкенда (см. com.aitutor.backend.dto.student.StudentStatsDto).

// Агрегированная статистика ученика для профиля — вложенный DTO ответа
// GET /api/user/me (поле stats, только для роли STUDENT).
export interface StudentStats {
    /** Работы в статусе COMPLETED. */
    completedCount: number;
    /** Среднее время решения одной завершённой работы, секунды; null — нет завершённых работ. */
    avgTimeSeconds: number | null;
    /** Пункты, где финальный ответ ученика не совпал с эталоном. */
    errorsCount: number;
}

// Реэкспорт типов для выполнения работ.
export type {
    WorkStatus,
    WorkItemType,
    ItemProgressStatus,
    StudentWorkDetailResponse,
    StudentItemProgressDto,
    StudentTaskItemDto,
    StudentSubmitAnswerRequest,
    StudentSubmitAnswerResponse,
    StudentWorkSummaryResponse,
}
    from '../work';

// Реэкспорт типов для карточек работ студента.
export type { StudentWorkCard } from './studentWorkCard';

export interface StudentWorkResponse {
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
