import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useWorkExecution } from '@/student/hooks/useWorkExecution';
import { BackLink } from '@/tasks/ui/widgets/BackLink/BackLink';
import { TaskPreviewChips } from '@/tasks/ui/widgets/TaskPreviewChips/TaskPreviewChips';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { parseWordFormationContent, parseGapFillContent } from '@/tasks/lib/parseTaskContent';
import type { CefrLevel, ItemType } from '@/tasks/types';
import styles from './WorkExecutionView.module.scss';

/** Форматирует секунды в «3 мин 12 с». */
function formatElapsed(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} мин ${s} с`;
}

interface WorkExecutionViewProps {
    workId: string;
}

export function WorkExecutionView({ workId }: WorkExecutionViewProps) {
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
    } = useWorkExecution(Number(workId));

    const isLastItem = currentItemIndex === totalItems - 1;

    const handleNextOrComplete = async () => {
        if (isLastItem) {
            await completeWork();
            navigate({
                to: '/student/work/$workId/report',
                params: { workId: String(workId) },
            });
        } else {
            nextItem();
        }
    };

    // Автостарт при монтировании
    useEffect(() => {
        startWork();
    }, [startWork]);

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
                <BackLink to="/" label="К заданиям" />
                <div className={styles.error}>
                    <p>Не удалось загрузить задание</p>
                    {error && <p className={styles.errorDetail}>{error}</p>}
                </div>
            </div>
        );
    }

    // Fallback: currentItemIndex вышел за границы (например, после обновления страницы)
    if (!currentItem) {
        navigate({
            to: '/student/work/$workId/report',
            params: { workId: String(workId) },
        });
        return null;
    }

    return (
        <div className={styles.page}>
            <BackLink to="/" label="К заданиям" />

            {/* Header */}
            <div className={styles.header}>
                <h1>{workDetail.taskName}</h1>
            </div>

            {/* Meta chips — полный список как на странице банка заданий */}
            <TaskPreviewChips
                grammarTypes={workDetail.taskTypes ?? []}
                topics={workDetail.topics ?? []}
                itemTypes={(workDetail.itemTypes ?? []) as ItemType[]}
                isMixed={workDetail.isMixed ?? false}
                levels={(workDetail.levels ?? []) as CefrLevel[]}
            />

            {/* Progress Section */}
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
                        style={{ width: `${totalItems > 0 ? (solvedItems / totalItems) * 100 : 0}%` }}
                    />
                </div>

                {/* Position nav */}
                <div className={styles.positionNav}>
                    {Array.from({ length: totalItems }, (_, i) => {
                        const isSolved = i < solvedItems;
                        const isCurrent = i === currentItemIndex;
                        return (
                            <div
                                key={i}
                                className={`${styles.posCell} ${isSolved ? styles.done : ''} ${isCurrent ? styles.current : ''}`}
                            >
                                {i + 1}
                                {isSolved && <span className={styles.posCheck}>✓</span>}
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
                                        const content = parseWordFormationContent(currentItem.content);
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
                                        return content?.options?.length ? `(${content.options.join(', ')})` : '';
                                    })()}
                                </span>
                            </>
                        )}
                    </p>
                )}

                {/* Answer Input */}
                <BaseInputText
                    id="answer-input"
                    placeholder="Введите ответ"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={isSubmitting || (feedback?.correct ?? false) || previousAnswers.length >= 3}
                    error={feedback && !feedback.correct ? 'Неверный ответ' : undefined}
                    variant="full"
                />
            </div>

            {/* Feedback — неверный ответ */}
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
                    <span className={`${styles.feedbackMark} ${styles.feedbackMarkCorrect}`}>✓</span>
                    <div>
                        <div className={`${styles.feedbackTitle} ${styles.feedbackTitleCorrect}`}>Верно</div>
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
                            <span className={`${styles.attemptMark} ${prev.correct ? styles.attemptMarkCorrect : ''}`}>
                                {prev.correct ? '✓' : '✗'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
                {feedback && feedback.correct ? (
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleNextOrComplete}
                        disabled={isCompleting}
                    >
                        {isCompleting ? 'Завершение...' : (isLastItem ? 'Завершить' : 'Далее')}
                    </button>
                ) : previousAnswers.length >= 3 ? (
                    <>
                        <div className={styles.attemptsLimitMessage}>
                            Попытки исчерпаны
                        </div>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            onClick={handleNextOrComplete}
                            disabled={isCompleting}
                        >
                            {isCompleting ? 'Завершение...' : (isLastItem ? 'Завершить' : 'Далее')}
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
