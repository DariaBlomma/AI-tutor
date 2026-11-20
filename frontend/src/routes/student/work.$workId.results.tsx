import { createFileRoute } from '@tanstack/react-router';
import { WorkResultsView } from '@/student/ui/views/WorkResultsView/WorkResultsView';
import { AuthService } from '@/auth/services/AuthService';

export const Route = createFileRoute('/student/work/$workId/results')({
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
    errorComponent: () => {
        return (
            <div style={{ padding: 20, color: 'var(--err)', textAlign: 'center' }}>
                <p>Страница не найдена</p>
            </div>
        );
    },
    component: () => <WorkResultsView workId={Number(Route.useParams().workId)} />,
});
