import { createFileRoute, redirect } from '@tanstack/react-router';
import { TaskCreateView } from '@/tasks/ui/views/TaskCreateView/TaskCreateView';
import { AuthService } from '@/auth/services/AuthService.ts';

export const Route = createFileRoute('/tasks-bank/create')({
    loader: () => {
        // Экран создания задания только для учителя (смотреть банк могут все, создавать — нет).
        if (AuthService.getUserRole() !== 'TEACHER') {
            throw redirect({ to: '/tasks-bank' });
        }
    },
    component: () => <TaskCreateView/>,
});
