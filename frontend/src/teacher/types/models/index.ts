// Краткая информация о привязанном учителе — вложенный DTO ответа
// GET /api/user/me (com.aitutor.backend.dto.user.UserResponse.TeacherBriefDto).
export interface TeacherBrief {
    id: number;
    userName: string;
    firstName: string | null;
    lastName: string | null;
    // Отображаемое имя: "Иван Петров" либо username, если имя не указано.
    fullName: string;
    // Код учителя (T-XXXXXX) — тот же, по которому ученик привязывается при регистрации.
    teacherCode: string;
}

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
