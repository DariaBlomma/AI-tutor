import { useMemo } from 'react';
import type { StudentWorkResponse } from '@/student/services/StudentDashboardService';
import type { StudentWorkCard } from '@/student/types/models/studentWorkCard';
import { mapToStudentWorkCard } from '@/student/utils/dashboardUtils.ts';

/**
 * Маппит StudentWorkResponse[] → StudentWorkCard[].
 * Используется на странице ДЗ для унификации данных с дашбордом.
 */
export function useMappedHomework(works: StudentWorkResponse[]): StudentWorkCard[] {
    return useMemo(
        () => works.map(mapToStudentWorkCard),
        [works],
    );
}
