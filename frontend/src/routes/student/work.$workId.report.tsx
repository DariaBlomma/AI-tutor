import { createFileRoute } from '@tanstack/react-router';
import { ReportDetailView } from '@/reports/ui/views/ReportDetailView/ReportDetailView';
import { StudentReportsService } from '@/reports/services/StudentReportsService';
import { AuthService } from '@/auth/services/AuthService';

export const Route = createFileRoute('/student/work/$workId/report')({
    loader: async ({ params }) => {
        const role = AuthService.getUserRole();
        if (role !== 'STUDENT') {
            throw new Error('Доступ запрещён');
        }
        const workId = Number(params.workId);
        if (isNaN(workId)) {
            throw new Error('Некорректный ID работы');
        }
        return { workId };
    },
    component: () => {
        const { workId } = Route.useLoaderData();
        return (
            <ReportDetailView
                fetcher={() => StudentReportsService.getWorkReportDetail(workId)}
                backLinkProps={{ to: '/student/homework', label: 'К домашним заданиям' }}
            />
        );
    },
});
