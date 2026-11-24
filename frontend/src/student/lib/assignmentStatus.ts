import type { StudentWorkCard } from '@/student/types/models/studentWorkCard';
import type { UITaskStatus } from '@/task/types/ui';
import { mapBackendStatusToUI } from '@/task/types/ui';

/**
 * Определяет UI-статус задачи на основе бэкенд-данных.
 * Перенаправляет на mapBackendStatusToUI из tasks/types/ui.
 */
export function getBadgeType(card: StudentWorkCard): UITaskStatus {
    return mapBackendStatusToUI(card.status, card.deadline, card.createdAt);
}
