// Зеркалит DTO бэкенда из пакета com.aitutor.backend.dto.report.

/** GET /teacher/students/{studentId}/work/{workId}/report */
export interface WorkReportDetailDto {
    workId: number;
    studentId: number;
    studentName: string;
    taskId: number;
    taskPublicId: string;
    taskName: string;
    topics: string[];
    taskTypes: string[];
    isMixed: boolean | null;
    context: string | null;
    startedAt: string | null;
    completedAt: string | null;
    durationSeconds: number | null;
    errorsCount: number;
    items: WorkItemAnswerDto[];
    aiComment: string | null;
}

/** Одна позиция в WorkReportDetailDto */
export interface WorkItemAnswerDto {
    taskItemId: number;
    position: number;
    itemType: string;
    prompt: string | null;
    content: string | null;
    correctAnswer: string | null;
    studentAnswer: string | null;
    correct: boolean;
    attemptsCount: number | null;
    hintsGiven: number | null;
}
