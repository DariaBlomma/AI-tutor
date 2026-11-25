import { createFileRoute } from '@tanstack/react-router';
import { StudentWorkExecutionView } from '@/student/ui/views/StudentWorkExecutionView/StudentWorkExecutionView.tsx';
import { AuthService } from '@/auth/services/AuthService';

export const Route = createFileRoute('/student/work/$workId/execution')({
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
    component: () => <StudentWorkExecutionView workId={Route.useParams().workId} />,
});
