import { createFileRoute } from '@tanstack/react-router';
import { StudentWorkService } from '@/student/services/StudentWorkService';
import { WorkExecutionView } from '@/student/ui/views/WorkExecutionView/WorkExecutionView';
import { AuthService } from '@/auth/services/AuthService';

export const Route = createFileRoute('/student/work/$workId')({
    loader: async ({ params }) => {
        const role = AuthService.getUserRole();
        if (role !== 'STUDENT') {
            throw new Error('Доступ запрещён');
        }
        const workId = Number(params.workId);
        if (isNaN(workId)) {
            throw new Error('Некорректный ID работы');
        }
        // Проверяем, что работа существует и принадлежит студенту
        await StudentWorkService.getWorkDetail(workId);
        return { workId };
    },
    component: () => <WorkExecutionView workId={Route.useParams().workId} />,
});
