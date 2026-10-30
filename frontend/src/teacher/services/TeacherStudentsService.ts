import { api } from '@/core/api/AxiosInstance';
import type { AssignTasksRequestDto, AssignmentResult, StudentBrief } from '@/teacher/types';

// Базовый путь учителских эндпоинтов работы с учениками (TeacherController +
// StudentWorkController /teacher/**, context-path /api уже в baseURL).
const TEACHER_PATH = '/teacher';

// Свои ученики учителя и назначение заданий (без курсов — конкретные taskIds).
export class TeacherStudentsService {
    /** GET /api/teacher/students -> List<StudentBriefResponse>. */
    static async getMyStudents(): Promise<StudentBrief[]> {
        const response = await api.get<StudentBrief[]>(`${TEACHER_PATH}/students`);
        return response.data;
    }

    /** POST /api/teacher/assignments -> AssignmentResultResponse (дубли молча пропускаются). */
    static async assignTasks(payload: AssignTasksRequestDto): Promise<AssignmentResult> {
        const response = await api.post<AssignmentResult>(`${TEACHER_PATH}/assignments`, payload);
        return response.data;
    }
}
