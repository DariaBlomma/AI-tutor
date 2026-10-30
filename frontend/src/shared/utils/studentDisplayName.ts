// Отображаемое имя пользователя: «Имя Фамилия», если заданы, иначе username.
export function studentDisplayName(user: { firstName: string | null; lastName: string | null; userName: string }): string {
    const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return full || user.userName;
}
