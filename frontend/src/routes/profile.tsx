import { createFileRoute } from '@tanstack/react-router';

import { UserProfileView } from '@/user/ui/views/UserProfileView/UserProfileView';

// Страница профиля — общая для учителя и ученика (различия внутри view по роли).
export const Route = createFileRoute('/profile')({
    component: () => <UserProfileView/>,
});
