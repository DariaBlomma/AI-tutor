import { api } from '@/core/api/AxiosInstance';
import type { StudentReportSummary } from '@/teacher/types';

// Базовый путь контроллера отчётов учителя — чтобы не повторять в эндпоинтах
// (TeacherReportController, context-path /api уже в baseURL).
const TEACHER_PATH = '/teacher';

// Отчёты учителя (только чтение). Уровень 1 — список своих учеников со счётчиками.
export class TeacherReportsService {
    static async getReportsOverview(): Promise<StudentReportSummary[]> {
        const response = await api.get<StudentReportSummary[]>(`${TEACHER_PATH}/reports`);
        return response.data;
    }
}
