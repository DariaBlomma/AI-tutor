import type { DashboardAssignment } from '@/student/types/models/dashboard';
import type { UITaskStatus } from '@/tasks/types/ui';
import { mapBackendStatusToUI } from '@/tasks/types/ui';

/**
 * Определяет UI-статус задачи на основе бэкенд-данных.
 * Перенаправляет на mapBackendStatusToUI из tasks/types/ui.
 */
export function getBadgeType(assignment: DashboardAssignment): UITaskStatus {
    return mapBackendStatusToUI(assignment.status, assignment.deadline, assignment.createdAt);
}
