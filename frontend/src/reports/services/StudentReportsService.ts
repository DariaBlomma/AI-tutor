import { api } from '@/core/api/AxiosInstance';
import type { WorkReportDetailDto } from '@/reports/types';

const STUDENT_PATH = '/student';

export class StudentReportsService {
    static async getWorkReportDetail(workId: number): Promise<WorkReportDetailDto> {
        const response = await api.get<WorkReportDetailDto>(
            `${STUDENT_PATH}/work/${workId}/report`,
        );
        return response.data;
    }
}
