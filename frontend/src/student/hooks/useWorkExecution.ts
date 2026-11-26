import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentWorkService } from '@/student/services/StudentWorkService';
import { extractErrorMessage } from '@/core/api/utils/errors';
import type { StudentWorkDetailResponse } from '@/student/types/work';

export interface FeedbackState {
    correct: boolean;
    attemptsCount: number;
    hint: string | null;
    allItemsSolved: boolean;
}

export interface PreviousAnswer {
    attempt: number;
    value: string;
    correct: boolean;
}

export type ItemResult = 'correct' | 'incorrect' | null;

export interface UseWorkExecutionResult {
    workDetail: StudentWorkDetailResponse | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    currentItemIndex: number;
    currentItem: StudentWorkDetailResponse['items'][number] | null;
    totalItems: number;
    solvedItems: number;
    elapsedSeconds: number;
    previousAnswers: PreviousAnswer[];
    itemResults: ItemResult[];
    remainingAttempts: number;
    answer: string;
    setAnswer: (value: string) => void;
    feedback: FeedbackState | null;
    startWork: () => Promise<void>;
    submitAnswer: () => Promise<void>;
    nextItem: () => void;
    completeWork: () => Promise<void>;
    isSubmitting: boolean;
    isCompleting: boolean;
    isExpired: boolean;
    retryComplete: () => void;
}

const MAX_ATTEMPTS = 3;

/** Проверяет, является ли ошибка признаком истечения срока (EXPIRED). */
function isExpiredError(error: unknown): boolean {
    const msg = extractErrorMessage(error) ?? '';
    return msg.includes('EXPIRED') || msg.includes('истёк') || msg.includes('Срок');
}

export function useWorkExecution(workId: number): UseWorkExecutionResult {
    const queryClient = useQueryClient();
    const queryKey = ['student', 'work', workId];

    const { data: workDetail, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn: () => StudentWorkService.getWorkDetail(workId),
        staleTime: 0,
        retry: false,
    });

    const totalItems = workDetail?.items.length ?? 0;

    const currentItemIndex = useMemo(() => {
        if (!workDetail) return 0;
        const index = workDetail.progress.findIndex(
            (p) => p.status !== 'SOLVED' && p.status !== 'FAILED',
        );
        return index === -1 ? workDetail.progress.length : index;
    }, [workDetail]);

    const currentItem = workDetail?.items[currentItemIndex] ?? null;
    const currentProgress = workDetail?.progress[currentItemIndex];

    const solvedItems = useMemo(() => {
        if (!workDetail) return 0;
        return workDetail.progress.filter((p) => p.status === 'SOLVED').length;
    }, [workDetail]);

    const [sessionAttempts, setSessionAttempts] = useState<PreviousAnswer[]>([]);

    const previousAnswers = useMemo<PreviousAnswer[]>(() => {
        if (sessionAttempts.length > 0) {
            return sessionAttempts;
        }
        if (currentProgress && currentProgress.answerAttempts > 0 && currentProgress.lastAnswer) {
            return [
                {
                    attempt: currentProgress.answerAttempts,
                    value: currentProgress.lastAnswer,
                    correct: false,
                },
            ];
        }
        return [];
    }, [sessionAttempts, currentProgress]);

    const remainingAttempts = useMemo(() => {
        if (!currentProgress) return MAX_ATTEMPTS;
        return Math.max(0, MAX_ATTEMPTS - currentProgress.answerAttempts);
    }, [currentProgress]);

    const itemResults = useMemo<ItemResult[]>(() => {
        if (!workDetail) return [];
        return workDetail.progress.map((p) => {
            if (p.status === 'SOLVED') return 'correct';
            if (p.status === 'FAILED') return 'incorrect';
            return null;
        });
    }, [workDetail]);

    const [answer, setAnswer] = useState('');
    const [lastFeedback, setLastFeedback] = useState<FeedbackState | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    // Сброс локальных состояний при переходе к новому вопросу
    useEffect(() => {
        setAnswer('');
        setLastFeedback(null);
        setSessionAttempts([]);
    }, [currentItemIndex]);

    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() => {
        if (!workDetail?.startedAt) return;
        const start = new Date(workDetail.startedAt).getTime();
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [workDetail?.startedAt]);

    const startMutation = useMutation({
        mutationFn: () => StudentWorkService.startWork(workId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const startWork = useCallback(async () => {
        if (workDetail?.startedAt) return;
        if (!startMutation.isPending && !startMutation.data) {
            await startMutation.mutateAsync();
        }
    }, [workDetail?.startedAt, startMutation]);

    const submitMutation = useMutation({
        mutationFn: ({ itemId, answerText }: { itemId: number; answerText: string }) => {
            return StudentWorkService.submitAnswer(workId, itemId, { answer: answerText });
        },
        onSuccess: (response, variables) => {
            setLastFeedback({
                correct: response.correct,
                attemptsCount: response.attemptsCount,
                hint: response.hint ?? null,
                allItemsSolved: response.allItemsSolved,
            });

            setSessionAttempts((prev) => [
                ...prev,
                {
                    attempt: response.attemptsCount,
                    value: variables.answerText,
                    correct: response.correct,
                },
            ]);

            queryClient.invalidateQueries({ queryKey });
        },
        onError: (err) => {
            if (isExpiredError(err)) {
                setIsExpired(true);
            }
        },
    });

    const submitAnswer = useCallback(async () => {
        if (!answer.trim() || !currentItem) return;
        await submitMutation.mutateAsync({ itemId: currentItem.id, answerText: answer.trim() });
    }, [answer, currentItem, submitMutation]);

    const nextItem = useCallback(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [queryClient, queryKey]);

    // Ref гарантирует однократный запуск завершения
    const completionStartedRef = useRef(false);

    // Определяем ДО useEffect завершения
    const allItemsSolved = currentItemIndex === totalItems;

    const completeMutation = useMutation({
        mutationFn: () => StudentWorkService.completeWork(workId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'work', workId, 'report'] });
        },
        onError: (err) => {
            if (isExpiredError(err)) {
                setIsExpired(true);
            }
            // При сетевой ошибке сбрасываем ref, чтобы дать повторить
            if (!isExpiredError(err)) {
                completionStartedRef.current = false;
            }
        },
    });

    const completeWork = useCallback(async () => {
        await completeMutation.mutateAsync();
    }, [completeMutation]);

    // Определяем ДО useEffect завершения
    const isCompleting = completeMutation.isPending;

    const retryComplete = useCallback(() => {
        completionStartedRef.current = false;
    }, []);

    // Автоматическое завершение: только вызываем мутацию, навигация — в компоненте
    useEffect(() => {
        if (allItemsSolved && !completionStartedRef.current && !isLoading && !isCompleting) {
            completionStartedRef.current = true;
            completeWork();
        }
    }, [allItemsSolved, isLoading, isCompleting, completeWork]);

    return {
        workDetail: workDetail ?? null,
        isLoading,
        isError,
        error: error ? extractErrorMessage(error) : null,
        currentItemIndex,
        currentItem,
        totalItems,
        solvedItems,
        elapsedSeconds,
        previousAnswers,
        itemResults,
        remainingAttempts,
        answer,
        setAnswer,
        feedback: lastFeedback,
        startWork,
        submitAnswer,
        nextItem,
        completeWork,
        isSubmitting: submitMutation.isPending,
        isCompleting,
        isExpired,
        retryComplete,
    };
}