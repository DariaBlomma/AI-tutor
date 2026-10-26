import { createFileRoute, redirect } from '@tanstack/react-router';
import { TeacherReportsView } from '@/teacher/ui/views/TeacherReportsView/TeacherReportsView';
import { AuthService } from '@/auth/services/AuthService.ts';

export const Route = createFileRoute('/teacher/reports')({
    loader: () => {
        // Страница только для учителя.
        if (AuthService.getUserRole() !== 'TEACHER') {
            throw redirect({ to: '/' });
        }
    },
    component: () => <TeacherReportsView/>,
});
