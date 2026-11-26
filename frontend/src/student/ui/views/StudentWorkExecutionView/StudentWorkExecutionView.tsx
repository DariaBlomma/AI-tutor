import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useWorkExecution } from '@/student/hooks/useWorkExecution';
import { BackLink } from '@/shared/widgets/BackLink/BackLink.tsx';
import { TaskPreviewChips } from '@/task/ui/widgets/TaskPreviewChips/TaskPreviewChips';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { parseWordFormationContent, parseGapFillContent } from '@/task/utils/parseTaskContent';
import type { CefrLevel, ItemType } from '@/task/types';
import type { WorkExecutionViewProps } from '@/student/types/ui';
import styles from './StudentWorkExecutionView.module.scss';

const MAX_ATTEMPTS = 3;

function formatElapsed(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} мин ${s} с`;
}

export function StudentWorkExecutionView({ workId }: WorkExecutionViewProps) {
    const navigate = useNavigate();
    const {
        workDetail,
        isLoading,
        isError,
        error,
        currentItemIndex,
        totalItems,
        solvedItems,
        elapsedSeconds,
        previousAnswers,
        itemResults,
        remainingAttempts,
        currentItem,
        answer,
        setAnswer,
        feedback,
        startWork,
        submitAnswer,
        nextItem,
        completeWork,
        isSubmitting,
        isCompleting,
        isExpired,
        retryComplete,
    } = useWorkExecution(Number(workId));

    const isLastItem = currentItemIndex === totalItems - 1;
    const allItemsSolved = currentItemIndex === totalItems;

    // Автостарт при монтировании
    useEffect(() => {
        startWork();
    }, [startWork]);

    // Навигация на отчёт после успешного завершения
    const navigateToReport = useRef(false);
    useEffect(() => {
        if (
            workDetail?.status === 'COMPLETED' &&
            !navigateToReport.current
        ) {
            navigateToReport.current = true;
            navigate({
                to: '/student/work/$workId/report',
                params: { workId: String(workId) },
            });
        }
    }, [workDetail?.status, navigate, workId]);

    const handleNext = () => {
        nextItem();
    };

    // === ЭКРАН: СРОК ИСТЁК ===
    if (isExpired) {
        return (
            <div className={styles.page}>
                <BackLink to="/student/work" label="К заданиям" ariaLabel="Назад к заданиям" />
                <div className={styles.expiredBanner}>
                    <h2>Срок выполнения истёк</h2>
                    <p>Вы не успели завершить задание до дедлайна.</p>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() =>
                            navigate({
                                to: '/student/work/$workId/report',
                                params: { workId: String(workId) },
                            })
                        }
                    >
                        Посмотреть отчёт
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Loader />
            </div>
        );
    }

    if (isError || !workDetail) {
        return (
            <div className={styles.page}>
                <BackLink to="/student/work" label="К заданиям" ariaLabel="Назад к заданиям" />
                <div className={styles.error}>
                    <p>Не удалось загрузить задание</p>
                    {error && <p className={styles.errorDetail}>{error}</p>}
                </div>
            </div>
        );
    }

    // === ЭКРАН: ЗАВЕРШЕНИЕ (ждём ответа бэка) ===
    if (allItemsSolved) {
        return (
            <div className={styles.page}>
                <BackLink to="/student/work" label="К заданиям" ariaLabel="Назад к заданиям" />
                <Loader />
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    {isCompleting
                        ? 'Завершение работы и подготовка отчёта...'
                        : 'Ошибка завершения. Попробовать снова?'}
                </p>
                {!isCompleting && (
                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={() => {
                                retryComplete();
                                completeWork();
                            }}
                        >
                            Попробовать снова
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (!currentItem) {
        return null;
    }

    const attemptsExhausted =
        feedback && !feedback.correct && feedback.attemptsCount >= MAX_ATTEMPTS;

    return (
        <div className={styles.page}>
            <BackLink to="/student/work" label="К заданиям" ariaLabel="Назад к заданиям" />

            <div className={styles.header}>
                <h1>{workDetail.taskName}</h1>
            </div>

            <TaskPreviewChips
                grammarTypes={workDetail.taskTypes ?? []}
                topics={workDetail.topics ?? []}
                itemTypes={(workDetail.itemTypes ?? []) as ItemType[]}
                isMixed={workDetail.isMixed ?? false}
                levels={(workDetail.levels ?? []) as CefrLevel[]}
            />

            {/* Progress */}
            <div className={styles.progress}>
                <div className={styles.progressTop}>
                    <span className={styles.progressLabel}>
                        {currentItemIndex + 1} из {totalItems}
                    </span>
                    <span className={styles.progressTime}>
                        {formatElapsed(elapsedSeconds)}
                    </span>
                </div>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{
                            width: `${totalItems > 0 ? (solvedItems / totalItems) * 100 : 0}%`,
                        }}
                    />
                </div>

                <div className={styles.positionNav}>
                    {Array.from({ length: totalItems }, (_, i) => {
                        const progressItem = workDetail?.progress[i];
                        const isSolved = progressItem?.status === 'SOLVED';
                        const isFailed = progressItem?.status === 'FAILED';
                        const isCurrent = i === currentItemIndex;
                        const isCorrect = itemResults[i] === 'correct';
                        const isIncorrect = itemResults[i] === 'incorrect';
                        const failedByAttempts =
                            isCurrent &&
                            feedback &&
                            !feedback.correct &&
                            feedback.attemptsCount >= 3;
                        const showFailed = isFailed || failedByAttempts;
                        return (
                            <div
                                key={i}
                                className={`${styles.posCell} ${isSolved ? styles.done : ''} ${showFailed ? styles.failed : ''} ${isCurrent ? styles.current : ''} ${isCorrect ? styles.correct : ''} ${isIncorrect ? styles.incorrect : ''}`}
                            >
                                {i + 1}
                                {isSolved && <span className={styles.posCheck}>✓</span>}
                                {showFailed && <span className={styles.posCheck}>✗</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Position Card */}
            <div className={styles.positionCard}>
                {currentItem.prompt && (
                    <p className={styles.prompt}>
                        {currentItem.prompt}
                        {currentItem.itemType === 'WORD_FORMATION' && (
                            <>
                                {' '}
                                <span className={styles.baseWord}>
                                    {(() => {
                                        const content = parseWordFormationContent(
                                            currentItem.content,
                                        );
                                        return content?.base ? `(${content.base})` : '';
                                    })()}
                                </span>
                            </>
                        )}
                        {currentItem.itemType === 'GAP_FILL' && (
                            <>
                                {' '}
                                <span className={styles.baseWord}>
                                    {(() => {
                                        const content = parseGapFillContent(currentItem.content);
                                        return content?.options?.length
                                            ? `(${content.options.join(', ')})`
                                            : '';
                                    })()}
                                </span>
                            </>
                        )}
                    </p>
                )}

                <BaseInputText
                    id="answer-input"
                    placeholder="Введите ответ"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={
                        isSubmitting ||
                        Boolean(feedback?.correct) ||
                        Boolean(attemptsExhausted)
                    }
                    error={feedback && !feedback.correct ? 'Неверный ответ' : undefined}
                    variant="full"
                />
            </div>

            {/* Feedback — неверный ответ (подсказка от ИИ, если есть) */}
            {feedback && !feedback.correct && feedback.hint && (
                <div className={styles.feedback}>
                    <span className={styles.feedbackMark}>✗</span>
                    <div>
                        <div className={styles.feedbackTitle}>Неверно</div>
                        <div className={styles.feedbackText}>{feedback.hint}</div>
                    </div>
                </div>
            )}

            {/* Feedback — верный ответ */}
            {feedback && feedback.correct && (
                <div className={`${styles.feedback} ${styles.feedbackCorrect}`}>
                    <span
                        className={`${styles.feedbackMark} ${styles.feedbackMarkCorrect}`}
                    >
                        ✓
                    </span>
                    <div>
                        <div
                            className={`${styles.feedbackTitle} ${styles.feedbackTitleCorrect}`}
                        >
                            Верно
                        </div>
                    </div>
                </div>
            )}

            {/* Attempts history */}
            {previousAnswers.length > 0 && (
                <div className={styles.attempts}>
                    <div className={styles.attemptsTitle}>Попытки</div>
                    {previousAnswers.map((prev) => (
                        <div key={prev.attempt} className={styles.attemptItem}>
                            <span className={styles.attemptNum}>
                                Попытка {prev.attempt}
                            </span>
                            <span className={styles.attemptValue}>{prev.value}</span>
                            <span
                                className={`${styles.attemptMark} ${prev.correct ? styles.attemptMarkCorrect : ''}`}
                            >
                                {prev.correct ? '✓' : '✗'}
                            </span>
                        </div>
                    ))}
                    {remainingAttempts > 0 && !feedback?.correct && (
                        <div className={styles.remainingAttempts}>
                            Осталось попыток: {remainingAttempts}
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
                {feedback && feedback.correct ? (
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleNext}
                        disabled={isCompleting}
                    >
                        {isLastItem ? 'Завершить' : 'Далее'}
                    </button>
                ) : attemptsExhausted ? (
                    <>
                        <div className={styles.attemptsLimitMessage}>
                            Попытки исчерпаны
                        </div>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleNext}
                            disabled={isCompleting}
                        >
                            {isLastItem ? 'Завершить' : 'Далее'}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={submitAnswer}
                        disabled={!answer.trim() || isSubmitting}
                    >
                        {isSubmitting ? 'Проверка...' : 'Проверить'}
                    </button>
                )}
            </div>
        </div>
    );
}