import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useWorkExecution } from '@/student/hooks/useWorkExecution';
import { BackLink } from '@/task/ui/widgets/BackLink/BackLink';
import { TaskPreviewChips } from '@/task/ui/widgets/TaskPreviewChips/TaskPreviewChips';
import { Loader } from '@/shared/ui-kit/Loader/Loader';
import { BaseInputText } from '@/shared/ui-kit/BaseInputText/BaseInputText';
import { parseWordFormationContent, parseGapFillContent } from '@/task/utils/parseTaskContent';
import type { CefrLevel, ItemType } from '@/task/types';
import styles from './StudentWorkExecutionView.module.scss';

/** Форматирует секунды в «3 мин 12 с». */
function formatElapsed(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} мин ${s} с`;
}

interface WorkExecutionViewProps {
    workId: string;
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
    } = useWorkExecution(Number(workId));

    const isLastItem = currentItemIndex === totalItems - 1;
    const allItemsSolved = currentItemIndex === totalItems;

    // Ref гарантирует, что процесс завершения запустится только один раз
    const completionStartedRef = useRef(false);

    // Автостарт при монтировании
    useEffect(() => {
        startWork();
    }, [startWork]);

    // ГЛАВНОЕ ИСПРАВЛЕНИЕ: Автоматическое завершение работы через useEffect
    useEffect(() => {
        if (allItemsSolved && !completionStartedRef.current && !isLoading && !isCompleting) {
            completionStartedRef.current = true;

            const finalizeWork = async () => {
                try {
                    // Ждем реального ответа от сервера о смене статуса на COMPLETED
                    await completeWork();
                } catch (err) {
                    console.error('Ошибка при завершении работы:', err);
                } finally {
                    // Переходим на отчет только ПОСЛЕ того, как сервер подтвердил завершение
                    navigate({
                        to: '/student/work/$workId/report',
                        params: { workId: String(workId) },
                    });
                }
            };

            finalizeWork();
        }
    }, [allItemsSolved, isLoading, isCompleting, completeWork, navigate, workId]);

    const handleNext = () => {
        // Просто инвалидируем кэш. Если это был последний вопрос,
        // useEffect выше сам заметит это и корректно завершит работу.
        nextItem();
    };

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

    // Если все вопросы решены, показываем лоадер завершения вместо формы.
    // Это защищает от ошибок рендера (currentItem === null) и дает время отработать useEffect.
    if (allItemsSolved) {
        return (
            <div className={styles.page}>
                <Loader />
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    Завершение работы и подготовка отчета...
                </p>
            </div>
        );
    }

    // Обязательная проверка для TypeScript (currentItem может быть null, но это не может произойти здесь)
    if (!currentItem) {
        return null;
    }

    return (
        <div className={styles.page}>
            <BackLink to="/" label="К заданиям" />

            {/* Header */}
            <div className={styles.header}>
                <h1>{workDetail.taskName}</h1>
            </div>

            {/* Meta chips */}
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
                    const progressItem = workDetail?.progress[i];
                    const isSolved = progressItem?.status === 'SOLVED';
                    const isFailed = progressItem?.status === 'FAILED';
                    const isCurrent = i === currentItemIndex;
                    const isCorrect = itemResults[i] === 'correct';
                    const isIncorrect = itemResults[i] === 'incorrect';
                    const failedByAttempts = isCurrent && feedback && !feedback.correct && feedback.attemptsCount >= 3;
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
                    disabled={isSubmitting || (feedback?.correct ?? false) || (feedback && !feedback.correct && feedback.attemptsCount >= 3)}
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
                {remainingAttempts > 0 && (
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
            ) : feedback && !feedback.correct && feedback.attemptsCount >= 3 ? (
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