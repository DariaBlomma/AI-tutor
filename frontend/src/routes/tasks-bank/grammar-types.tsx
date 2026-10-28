import { createFileRoute, redirect } from '@tanstack/react-router';
import { RefsManageView } from '@/tasks/ui/views/RefsManageView/RefsManageView';
import { AuthService } from '@/auth/services/AuthService.ts';

export const Route = createFileRoute('/tasks-bank/grammar-types')({
    loader: () => {
        // Управление справочником — только для учителя.
        if (AuthService.getUserRole() !== 'TEACHER') {
            throw redirect({ to: '/tasks-bank' });
        }
    },
    component: () => <RefsManageView kind="grammar-types"/>,
});
