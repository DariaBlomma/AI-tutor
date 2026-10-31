import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService.ts';
import { TaskEditView } from '@/tasks/ui/views/TaskEditView/TaskEditView';

// Страница редактирования задания: доступна только учителю (бэк дополнительно
// проверяет владение — чужое задание даст 403 при сохранении).
// ВАЖНО про матчинг роутов: файл лежит ПЛОСКО рядом с $publicId и называется
// edit.$publicId (роут /tasks-bank/edit/$publicId), а НЕ $publicId.edit.
// Вариант «$publicId» + дочерний «edit» не подходит: параметр-сегмент TanStack Router
// матчится жадно и поглощает слэш, поэтому /tasks-bank/T-000123/edit считался бы
// publicId="T-000123/edit" и открывал страницу просмотра без ошибки. Буквенный
// префикс «edit» матчинится раньше параметрического сегмента — коллизии нет.
export const Route = createFileRoute('/tasks-bank/edit/$publicId')({
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
