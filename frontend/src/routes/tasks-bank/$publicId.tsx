import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TaskDetailView } from '@/tasks/ui/views/TaskDetailView/TaskDetailView';

// Страница просмотра задания: открывается по клику на publicId в банке заданий.
export const Route = createFileRoute('/tasks-bank/$publicId')({
    loader: () => {
        // Смотреть задание могут все авторизованные (как и банк); действия внутри — только учителю.
        if (!AuthService.isAuthenticated) {
            throw redirect({ to: '/auth/login' });
        }
    },
    component: ({ params }) => <TaskDetailView publicId={params.publicId} />,
});
