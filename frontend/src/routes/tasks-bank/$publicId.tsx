import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TaskDetailView } from '@/tasks/ui/views/TaskDetailView/TaskDetailView';

// Страница просмотра задания: открывается по клику на publicId в банке заданий.
export const Route = createFileRoute('/tasks-bank/$publicId')({
    loader: () => {
        // Весь раздел «Банк заданий» закрыт от ученика: доступ только учителю.
        if (!AuthService.isAuthenticated) {
            throw redirect({ to: '/auth/login' });
        }
        if (AuthService.getUserRole() !== 'TEACHER') {
            throw redirect({ to: '/' });
        }
    },
    // Параметры роута передаются компоненту только через Route.useParams():
    // деструктуризация props ({ params }) даёт undefined и краш «reading 'publicId'».
    component: () => <TaskDetailView publicId={Route.useParams().publicId} />,
});
