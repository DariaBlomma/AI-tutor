import { createFileRoute } from '@tanstack/react-router';
import { ReportDetailView } from '@/reports/ui/views/ReportDetailView/ReportDetailView';
import { ReportsService } from '@/reports/services/ReportsService';
import { AuthService } from '@/auth/services/AuthService';

export const Route = createFileRoute('/teacher/students/$studentId/work/$workId/report')({
    loader: async ({ params }) => {
        const role = AuthService.getUserRole();
        if (role !== 'TEACHER') {
            throw new Error('Доступ запрещён');
        }
        const studentId = Number(params.studentId);
        const workId = Number(params.workId);
        if (isNaN(studentId) || isNaN(workId)) {
            throw new Error('Некорректный ID');
        }
        return { studentId, workId };
    },
    component: () => {
        const { studentId, workId } = Route.useLoaderData();
        return <ReportDetailView fetcher={() => ReportsService.getWorkReportDetail(studentId, workId)} showStudentName={false} />;
    },
});
