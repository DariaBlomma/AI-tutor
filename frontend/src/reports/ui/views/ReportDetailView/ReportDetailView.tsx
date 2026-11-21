import { BackLink } from '@/tasks/ui/widgets/BackLink/BackLink';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { ReportSummary } from '@/reports/ui/widgets/ReportSummary/ReportSummary';
import { ReportTaskPreview } from '@/reports/ui/widgets/ReportTaskPreview/ReportTaskPreview';
import { ReportPositionItem } from '@/reports/ui/widgets/ReportPositionItem/ReportPositionItem';
import { ReportAiComment } from '@/reports/ui/widgets/ReportAiComment/ReportAiComment';
import { useReportDetail } from '@/reports/hooks/useReportDetail';
import type { WorkReportDetailDto } from '@/reports/types';
import styles from './ReportDetailView.module.scss';

interface ReportDetailViewProps {
    fetcher: () => Promise<WorkReportDetailDto>;
    showStudentName?: boolean;
}

export function ReportDetailView({ fetcher, showStudentName = false }: ReportDetailViewProps) {
    const { report, isLoading, isError } = useReportDetail(fetcher);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Loader />
            </div>
        );
    }

    if (isError || !report) {
        return (
            <div className={styles.page}>
                <BackLink />
                <div className={styles.error}>Не удалось загрузить отчёт</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <BackLink />

            <ReportSummary report={report} showStudentName={showStudentName} />

            <ReportTaskPreview report={report} />

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Разбор по позициям</h2>
                <div className={styles.positionsList}>
                    {report.items.map((item) => (
                        <ReportPositionItem key={item.taskItemId} item={item} />
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Комментарий ИИ</h2>
                <ReportAiComment />
            </section>
        </div>
    );
}
