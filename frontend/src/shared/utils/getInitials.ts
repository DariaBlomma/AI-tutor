// Инициалы для аватара: первые буквы имени и фамилии (Иван Петров -> ИП).
export function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');
}
