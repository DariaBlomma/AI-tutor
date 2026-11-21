import { getInitials } from '@/shared/utils/getInitials';
import { TaskPreviewChips } from '@/tasks/ui/widgets/TaskPreviewChips/TaskPreviewChips';
import type { ItemType } from '@/tasks/types';
import type { WorkReportDetailDto } from '@/reports/types';
import styles from './ReportSummary.module.scss';

interface FormatDurationResult {
    minutes: number;
    seconds: number;
}

function formatDuration(seconds: number | null): string {
    if (seconds == null) return '—';
    const { minutes, seconds: sec } = _formatDurationInternal(seconds);
    return `${minutes} мин ${sec} с`;
}

function _formatDurationInternal(seconds: number): FormatDurationResult {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { minutes, seconds: secs };
}

interface ReportSummaryProps {
    report: WorkReportDetailDto;
    showStudentName?: boolean;
}

export function ReportSummary({ report, showStudentName = false }: ReportSummaryProps) {
    const uniqueItemTypes = [...new Set(report.items.map((item) => item.itemType))].filter(
        (t): t is ItemType => ['WORD_FORMATION', 'GAP_FILL', 'TFNS', 'MATCHING'].includes(t),
    );
    const totalItems = report.items.length;
    const solvedItems = report.items.filter((item) => item.correct).length;

    return (
        <div className={styles.summary}>
            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h1 className={styles.title}>{report.taskName?.trim() || report.taskPublicId}</h1>
                    {showStudentName && (
                        <div className={styles.studentInfo}>
                            <div className={styles.avatar}>
                                {getInitials(report.studentName)}
                            </div>
                            <span className={styles.studentName}>{report.studentName}</span>
                        </div>
                    )}
                </div>
            </div>

            <TaskPreviewChips
                levels={[]}
                grammarTypes={report.taskTypes.map((t) => ({ id: 0, name: t, description: null, isActive: true }))}
                topics={report.topics.map((t) => ({ id: 0, name: t }))}
                itemTypes={uniqueItemTypes}
                isMixed={report.isMixed ?? false}
            />

            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Время</span>
                    <span className={styles.metricValue}>{formatDuration(report.durationSeconds)}</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Ошибок</span>
                    <span className={styles.metricValue}>{report.errorsCount}</span>
                </div>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Позиций</span>
                    <span className={styles.metricValue}>
                        {solvedItems} / {totalItems}
                    </span>
                </div>
            </div>
        </div>
    );
}
