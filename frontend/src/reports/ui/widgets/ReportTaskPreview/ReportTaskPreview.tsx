import { parseTaskContext } from '@/tasks/lib/parseTaskContent';
import type { WorkReportDetailDto } from '@/reports/types';
import styles from './ReportTaskPreview.module.scss';

interface ReportTaskPreviewProps {
    report: WorkReportDetailDto;
}

export function ReportTaskPreview({ report }: ReportTaskPreviewProps) {
    const context = parseTaskContext(report.context);

    // Проверяем, есть ли что показывать
    const hasContent = context != null;

    if (!hasContent) {
        return null;
    }

    return (
        <section className={styles.section}>
            {context.title && (
                <h2 className={styles.sectionTitle}>{context.title}</h2>
            )}
            {context.text && (
                <p className={styles.text}>{context.text}</p>
            )}
        </section>
    );
}
