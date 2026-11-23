import { useReportDetail } from '@/reports/hooks/useReportDetail'; // Укажите ваш путь
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { BackLink } from '@/tasks/ui/widgets/BackLink/BackLink'; // Или ваш компонент ссылки
import { ReportSummary } from '@/reports/ui/widgets/ReportSummary/ReportSummary';
import { ReportTaskPreview } from '@/reports/ui/widgets/ReportTaskPreview/ReportTaskPreview';
import { ReportPositionItem } from '@/reports/ui/widgets/ReportPositionItem/ReportPositionItem';
import { ReportAiComment } from '@/reports/ui/widgets/ReportAiComment/ReportAiComment';
import styles from './ReportDetailView.module.scss';

interface ReportDetailViewProps {
    workId: number;
    fetcher: () => Promise<any>;
    backLinkProps?: { to: string; label: string };
    showStudentName?: boolean;
}

export function ReportDetailView({
    workId,
    fetcher,
    backLinkProps,
    showStudentName = true
}: ReportDetailViewProps) {
    // Передаем workId и fetcher в наш умный хук
    const { data: report, isLoading, isError, error } = useReportDetail(workId, fetcher);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                <Loader />
                <p style={{ marginLeft: '10px' }}>Загрузка отчета...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                {backLinkProps && <BackLink {...backLinkProps} />}
                <h3>Не удалось загрузить отчет</h3>
                <p>Ошибка: {(error as any)?.message || 'Неизвестная ошибка'}</p>
            </div>
        );
    }

    if (!report) return null;

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