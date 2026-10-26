// Контракты бэкенда для отчётов учителя
// (см. com.aitutor.backend.dto.report.StudentReportSummaryDto).

// GET /api/teacher/reports -> уровень 1 вкладки «Отчёты»: сводка по одному ученику.
export interface StudentReportSummary {
    studentId: number;
    studentName: string;
    email: string;
    /** Активные назначения всего = ASSIGNED + IN_PROGRESS. */
    assignedCount: number;
    /** Из них уже начато учеником (IN_PROGRESS). */
    inProgressCount: number;
}
