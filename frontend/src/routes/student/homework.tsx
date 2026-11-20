import { createFileRoute } from '@tanstack/react-router';
import { AuthService } from '@/auth/services/AuthService';
import { StudentHomeworkView } from '@/student/ui/views/HomeworkView/StudentHomeworkView';

export const Route = createFileRoute('/student/homework')({
    loader: async () => {
        const role = AuthService.getUserRole();
        if (role !== 'STUDENT') {
            throw new Error('Доступ запрещён');
        }
    },
    component: StudentHomeworkView,
});
