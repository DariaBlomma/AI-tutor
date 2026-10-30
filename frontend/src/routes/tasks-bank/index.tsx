import { createFileRoute, redirect } from '@tanstack/react-router';
import { TasksBankView } from '@/tasks/ui/views/TasksBankView/TasksBankView';
import { AuthService } from '@/auth/services/AuthService.ts';

export const Route = createFileRoute('/tasks-bank/')({
    loader: () => {
        // Раздел «Банк заданий» виден только учителю: ученика редиректим на главную.
        if (!AuthService.isAuthenticated) {
            throw redirect({ to: '/auth/login' });
        }
        if (AuthService.getUserRole() !== 'TEACHER') {
            throw redirect({ to: '/' });
        }
    },
    component: () => <TasksBankView/>,
});
