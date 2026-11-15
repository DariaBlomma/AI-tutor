// Зеркалит com.aitutor.backend.enums.WorkStatus.
export type WorkStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

// Маппинг бэкенд статуса на UI-статус дашборда.
export function toDashboardStatus(raw: WorkStatus): 'NEW' | 'IN_PROGRESS' | 'OVERDUE' {
    switch (raw) {
        case 'ASSIGNED': return 'NEW';
        case 'IN_PROGRESS': return 'IN_PROGRESS';
        case 'EXPIRED': return 'OVERDUE';
        default: return 'NEW';
    }
}
