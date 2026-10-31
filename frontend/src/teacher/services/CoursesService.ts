import { api } from '@/core/api/AxiosInstance';
import type { CourseByTask, CourseRequestDto, CourseSummary, CourseTaskAddRequestDto } from '@/teacher/types';

// Базовый путь контроллера курсов (CourseController, context-path /api уже в baseURL).
const COURSES_PATH = '/courses';

// Курсы учителя: список с флагом «задание уже в курсе» (попап выбора курса на странице
// просмотра задания) и добавление/удаление задания из курса.
export class CoursesService {
    /** GET /api/courses -> List<CourseSummaryResponse> — список «Мои курсы» (фильтр банка заданий). */
    static async getCourses(): Promise<CourseSummary[]> {
        const response = await api.get<CourseSummary[]>(COURSES_PATH);
        return response.data;
    }

    /** POST /api/courses { name } -> CourseResponse — создание курса (нужно только название). */
    static async createCourse(name: string): Promise<CourseSummary> {
        const response = await api.post<CourseSummary>(COURSES_PATH, { name } satisfies CourseRequestDto);
        // Ответ CourseResponse содержит те же id/name (+ состав tasks — он нам здесь не нужен).
        return { id: response.data.id, name: response.data.name, taskCount: 0, createdAt: response.data.createdAt ?? '', updatedAt: response.data.updatedAt ?? '' };
    }

    /** GET /api/courses?taskId={taskId} -> List<CourseByTaskResponse>. */
    static async getCoursesWithTaskFlag(taskId: number): Promise<CourseByTask[]> {
        const response = await api.get<CourseByTask[]>(COURSES_PATH, { params: { taskId } });
        return response.data;
    }

    /** POST /api/courses/{courseId}/tasks -> CourseResponse (position=null — в конец). */
    static async addTaskToCourse(courseId: number, payload: CourseTaskAddRequestDto): Promise<void> {
        await api.post(`${COURSES_PATH}/${courseId}/tasks`, payload);
    }

    /** DELETE /api/courses/{courseId}/tasks/{taskId} -> CourseResponse (задание остаётся в банке). */
    static async removeTaskFromCourse(courseId: number, taskId: number): Promise<void> {
        await api.delete(`${COURSES_PATH}/${courseId}/tasks/${taskId}`);
    }
}
