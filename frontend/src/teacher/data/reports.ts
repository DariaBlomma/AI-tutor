// Мок-данные уровня 1 «Отчёты»: заглушки до подключения GET /teacher/reports
// (см. SHOW_TMP_DATA в TeacherReportsView).
import type { StudentReportSummary } from '@/teacher/types';

export const MOCK_TEACHER_REPORTS: StudentReportSummary[] = [
    { studentId: 1, studentName: 'Иван Петров', email: 'ivan.p@example.com', assignedCount: 3, inProgressCount: 1 },
    { studentId: 2, studentName: 'Мария Сидорова', email: 'maria.s@example.com', assignedCount: 5, inProgressCount: 2 },
    { studentId: 3, studentName: 'Алексей Смирнов', email: 'alex.s@example.com', assignedCount: 1, inProgressCount: 0 },
];
