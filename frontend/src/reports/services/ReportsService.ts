import { api } from '@/core/api/AxiosInstance';
import type { WorkReportDetailDto } from '@/reports/types';

const REPORTS_PATH = '/teacher';

export class ReportsService {
    static async getWorkReportDetail(
        studentId: number,
        workId: number,
    ): Promise<WorkReportDetailDto> {
        const response = await api.get<WorkReportDetailDto>(
            `${REPORTS_PATH}/students/${studentId}/work/${workId}/report`,
        );
        return response.data;
    }
}
