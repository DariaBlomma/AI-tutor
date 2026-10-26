import { useEffect, useState } from 'react';
import type { StudentReportSummary } from '@/teacher/types';

interface UseTeacherReportsResult {
    reports: StudentReportSummary[];
    isLoading: boolean;
    isError: boolean;
}

// Уровень 1 «Отчёты»: сводка по своим ученикам (GET /teacher/reports).
// fetcher внедряется извне — хук не зависит от транспорта и легко тестируется.
export function useTeacherReports(
    fetcher: () => Promise<StudentReportSummary[]>,
): UseTeacherReportsResult {
    const [reports, setReports] = useState<StudentReportSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let active = true;

        fetcher()
            .then((data) => {
                if (!active) return;
                setReports(data);
            })
            .catch(() => {
                if (active) setIsError(true);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [fetcher]);

    return { reports, isLoading, isError };
}
