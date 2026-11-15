import { createFileRoute, Outlet } from '@tanstack/react-router';
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
        return { workId };
    },
    component: () => <Outlet />,
});
