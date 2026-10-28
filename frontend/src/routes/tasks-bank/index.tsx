import { createFileRoute, redirect } from '@tanstack/react-router';
import { TasksBankView } from '@/tasks/ui/views/TasksBankView/TasksBankView';
import { AuthService } from '@/auth/services/AuthService.ts';

export const Route = createFileRoute('/tasks-bank/')({
    loader: () => {
        // Общая страница для учителя и ученика: смотреть банк могут все авторизованные.
        // Кнопки создания/редактирования внутри страницы показываются только учителю.
        if (!AuthService.isAuthenticated) {
            throw redirect({ to: '/auth/login' });
        }
    },
    component: () => <TasksBankView/>,
});
