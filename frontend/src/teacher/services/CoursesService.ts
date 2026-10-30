import { api } from '@/core/api/AxiosInstance';
import type { CourseByTask, CourseTaskAddRequestDto } from '@/teacher/types';

// Базовый путь контроллера курсов (CourseController, context-path /api уже в baseURL).
const COURSES_PATH = '/courses';

// Курсы учителя: список с флагом «задание уже в курсе» (попап выбора курса на странице
// просмотра задания) и добавление/удаление задания из курса.
export class CoursesService {
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
