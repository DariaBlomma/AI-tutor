import { api } from '@/core/api/AxiosInstance';
import type {
    StudentWorkDetailResponse,
    StudentSubmitAnswerRequest,
    StudentSubmitAnswerResponse,
    StudentWorkSummaryResponse,
} from '@/student/types/work';

const STUDENT_PATH = '/student';

/**
 * Сервис для выполнения работ студентом.
 * Использует endpoint'ы бэкенда:
 * - GET /api/student/work/{workId} — детальная информация
 * - POST /api/student/work/{workId}/start — старт работы
 * - POST /api/student/work/{workId}/items/{itemId}/submit — проверка ответа
 * - POST /api/student/work/{workId}/complete — завершение работы
 * - GET /api/student/work/{workId}/summary — результаты
 */
export class StudentWorkService {
    /** GET /api/student/work/{workId} — детальная информация о работе. */
    static async getWorkDetail(workId: number): Promise<StudentWorkDetailResponse> {
        const response = await api.get<StudentWorkDetailResponse>(`${STUDENT_PATH}/work/${workId}`);
        return response.data;
    }

    /** POST /api/student/work/{workId}/start — старт работы (ASSIGNED → IN_PROGRESS). */
    static async startWork(workId: number): Promise<StudentWorkDetailResponse> {
        const response = await api.post<StudentWorkDetailResponse>(`${STUDENT_PATH}/work/${workId}/start`);
        return response.data;
    }

    /** POST /api/student/work/{workId}/items/{itemId}/submit — проверка ответа. */
    static async submitAnswer(
        workId: number,
        itemId: number,
        data: StudentSubmitAnswerRequest,
    ): Promise<StudentSubmitAnswerResponse> {
        const response = await api.post<StudentSubmitAnswerResponse>(
            `${STUDENT_PATH}/work/${workId}/items/${itemId}/submit`,
            data,
        );
        return response.data;
    }

    /** POST /api/student/work/{workId}/complete — завершение работы (IN_PROGRESS → COMPLETED). */
    static async completeWork(workId: number): Promise<StudentWorkCompleteResponse> {
        const response = await api.post<StudentWorkCompleteResponse>(`${STUDENT_PATH}/work/${workId}/complete`);
        return response.data;
    }

    /** GET /api/student/work/{workId}/summary — результаты работы. */
    static async getWorkSummary(workId: number): Promise<StudentWorkSummaryResponse> {
        const response = await api.get<StudentWorkSummaryResponse>(`${STUDENT_PATH}/work/${workId}/summary`);
        return response.data;
    }
}
