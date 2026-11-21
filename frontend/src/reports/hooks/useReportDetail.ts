import { useEffect, useState } from 'react';
import type { WorkReportDetailDto } from '@/reports/types';

interface UseReportDetailResult {
    report: WorkReportDetailDto | null;
    isLoading: boolean;
    isError: boolean;
}

export function useReportDetail(
    fetcher: () => Promise<WorkReportDetailDto> | null,
): UseReportDetailResult {
    const [report, setReport] = useState<WorkReportDetailDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let active = true;

        const fn = fetcher();
        if (!fn) {
            setIsLoading(false);
            return;
        }

        fn
            .then((data) => {
                if (!active) return;
                setReport(data);
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

    return { report, isLoading, isError };
}
