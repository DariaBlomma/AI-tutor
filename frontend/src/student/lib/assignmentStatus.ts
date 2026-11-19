import type { DashboardAssignment } from '@/student/types/models/dashboard';
import type { StatusType } from '@/student/ui/components/StatusBadge/StudentStatusBadge';

/** Количество миллисекунд в одном дне. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Возвращает количество полных дней до дедлайна.
 * Отрицательное значение — дедлайн прошёл.
 */
export function daysUntilDeadline(deadline: string | null | undefined): number {
    if (!deadline) return Infinity;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    return Math.floor((dl.getTime() - now.getTime()) / MS_PER_DAY);
}

/**
 * Определяет тип бейджа на основе статуса и дедлайна задания.
 *
 * - IN_PROGRESS → 'in-progress'
 * - ASSIGNED + дедлайн ≤ 7 дней → 'urgent' («Скоро дедлайн»)
 * - ASSIGNED + дедлайн > 7 дней → 'new'
 * - COMPLETED → 'completed'
 * - EXPIRED → 'overdue'
 */
export function getBadgeType(assignment: DashboardAssignment): StatusType {
    if (assignment.status === 'IN_PROGRESS') return 'in-progress';
    if (assignment.status === 'COMPLETED') return 'completed';
    if (assignment.status === 'EXPIRED') return 'overdue';
    if (assignment.status === 'ASSIGNED') {
        const days = daysUntilDeadline(assignment.deadline);
        if (days >= 0 && days <= 7) return 'urgent';
        return 'new';
    }
    return 'new';
}
