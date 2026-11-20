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
