import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TaskEditView } from '@/tasks/ui/views/TaskEditView/TaskEditView';

// Страница редактирования задания: доступна только учителю (бэк дополнительно
// проверяет владение — чужое задание даст 403 при сохранении).
export const Route = createFileRoute('/tasks-bank/$publicId/edit')({
    loader: () => {
        if (!AuthService.isAuthenticated) {
            throw redirect({ to: '/auth/login' });
        }
        if (AuthService.getUserRole() !== 'TEACHER') {
            throw redirect({ to: '/' });
        }
    },
    component: () => <TaskEditView publicId={Route.useParams().publicId} />,
});
