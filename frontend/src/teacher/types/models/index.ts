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

// Контракты бэкенда для страницы просмотра задания (курсы, назначение ученикам):
// com.aitutor.backend.dto.course / dto.student.

// GET /api/courses?taskId= -> CourseByTaskResponse — курс в попапе выбора курса.
export interface CourseByTask {
    id: number;
    name: string;
    /** Задание уже в курсе: в попапе этот курс предлагается убрать, а не добавить. */
    hasTask: boolean;
}

// POST /api/courses/{id}/tasks -> CourseTaskAddRequest (position=null — в конец курса).
export interface CourseTaskAddRequestDto {
    taskId: number;
    position?: number | null;
}

// GET /api/courses (без taskId) -> CourseSummaryResponse — строка списка «Мои курсы»
// (фильтр по курсам на странице банка заданий).
export interface CourseSummary {
    id: number;
    name: string;
    taskCount: number;
    createdAt: string;
    updatedAt: string;
}

// POST /api/courses -> CourseResponse (создание/переименование — только name).
export interface CourseRequestDto {
    name: string;
}

// GET /api/teacher/students -> StudentBriefResponse (ученик в списке назначения).
export interface StudentBrief {
    id: number;
    userName: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
}

// POST /api/teacher/assignments -> AssignTasksRequest. deadline — ISO-8601 UTC или null.
export interface AssignTasksRequestDto {
    studentIds: number[];
    taskIds: number[];
    deadline?: string | null;
}

// POST /api/teacher/assignments -> AssignmentResultResponse.
// Дубли активных назначений бэк молча пропускает — об этом говорит skippedDuplicateCount.
export interface AssignmentResult {
    createdCount: number;
    skippedDuplicateCount: number;
}
