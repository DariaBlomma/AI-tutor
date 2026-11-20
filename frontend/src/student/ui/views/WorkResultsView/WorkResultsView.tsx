import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { StudentWorkService } from '@/student/services/StudentWorkService';
import { BackLink } from '@/tasks/ui/widgets/BackLink/BackLink';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import styles from './WorkResultsView.module.scss';

/** Форматирует секунды в «59 мин 0 с». */
function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} мин ${s} с`;
}

interface WorkResultsViewProps {
    workId: number;
}

export function WorkResultsView({ workId }: WorkResultsViewProps) {
    const navigate = useNavigate();

    const { data: summary, isLoading, isError } = useQuery({
        queryKey: ['student', 'work', workId, 'summary'],
        queryFn: () => StudentWorkService.getWorkSummary(workId),
        staleTime: Infinity,
        retry: false,
    });

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Loader />
            </div>
        );
    }

    if (isError || !summary) {
        return (
            <div className={styles.page}>
                <BackLink to="/" label="К заданиям" />
                <div className={styles.error}>
                    <p>Не удалось загрузить результаты</p>
                </div>
            </div>
        );
    }

    const correctRate = summary.totalItems > 0
        ? Math.round(((summary.firstTryCorrect + summary.correctAfterHints) / summary.totalItems) * 100)
        : 0;

    return (
        <div className={styles.page}>
            <BackLink to="/" label="К заданиям" />

            {/* Header */}
            <div className={styles.header}>
                <h1>{summary.taskName ?? 'Работа'}</h1>
                <span className={styles.badge}>Выполнено</span>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{correctRate}%</div>
                    <div className={styles.statLabel}>Правильных</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {summary.solvedItems ?? '—'}/{summary.totalItems}
                    </div>
                    <div className={styles.statLabel}>Пунктов</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {summary.durationSeconds != null ? formatDuration(summary.durationSeconds) : '—'}
                    </div>
                    <div className={styles.statLabel}>Время</div>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.primaryBtn}`}
                    onClick={() => navigate({ to: '/' })}
                >
                    На главную
                </button>
            </div>
        </div>
    );
}
