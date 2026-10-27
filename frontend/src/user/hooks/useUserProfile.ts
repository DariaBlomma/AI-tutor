import { useQuery } from '@tanstack/react-query';

import { UserService } from '@/user/services/UserService';

// Данные профиля текущего пользователя (GET /user/me) через react-query.
export function useUserProfile() {
    return useQuery({
        queryKey: ['user', 'profile'],
        queryFn: () => UserService.getProfile(),
    });
}
