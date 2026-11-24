import { useState, useCallback, useMemo, useEffect } from 'react';
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

// Убрали id. attempt (1, 2, 3) и так уникален в рамках одного вопроса
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
    showHint: boolean;
    toggleHint: () => void;
    answer: string;
    setAnswer: (value: string) => void;
    feedback: FeedbackState | null;
    startWork: () => Promise<void>;
    submitAnswer: () => Promise<void>;
    nextItem: () => void;
    completeWork: () => Promise<void>;
    isSubmitting: boolean;
    isCompleting: boolean;
}

const MAX_ATTEMPTS = 3;

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
        (p) => p.status !== 'SOLVED' && p.status !== 'FAILED'
        );
        return index === -1 ? workDetail.progress.length : index;
    }, [workDetail]);

    const currentItem = workDetail?.items[currentItemIndex] ?? null;
    const currentProgress = workDetail?.progress[currentItemIndex];

    const solvedItems = useMemo(() => {
        if (!workDetail) return 0;
        return workDetail.progress.filter((p) => p.status === 'SOLVED').length;
    }, [workDetail]);

    // 1. ЛОКАЛЬНАЯ ИСТОРИЯ ТОЛЬКО ДЛЯ ТЕКУЩЕЙ СЕССИИ
    const [sessionAttempts, setSessionAttempts] = useState<PreviousAnswer[]>([]);

    // 2. ПРОСТАЯ И ПОНИТНАЯ ЛОГИКА СБОРА ПОПЫТОК
    const previousAnswers = useMemo<PreviousAnswer[]>(() => {
        // Если есть данные текущей сессии, показываем их (они содержат реальные тексты ответов)
        if (sessionAttempts.length > 0) {
            return sessionAttempts;
        }
        // Фолбэк после перезагрузки страницы: показываем только последнюю попытку,
        // так как бэкенд хранит только lastAnswer
        if (currentProgress && currentProgress.answerAttempts > 0 && currentProgress.lastAnswer) {
            return [{
                attempt: currentProgress.answerAttempts,
                value: currentProgress.lastAnswer,
                correct: false, // При перезагрузке мы не знаем точно, но раз мы всё еще на этом шаге, скорее всего нет
            }];
        }
        return [];
    }, [sessionAttempts, currentProgress]);

    // 3. ОСТАВШИЕСЯ ПОПЫТКИ СЧИТАЕМ СТРОГО ПО ДАННЫМ БЭКЕНДА
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
    const [showHint, setShowHint] = useState(false);
    const [lastFeedback, setLastFeedback] = useState<FeedbackState | null>(null);

    // Сброс всех локальных состояний при переходе к новому вопросу
    useEffect(() => {
        setAnswer('');
        setLastFeedback(null);
        setShowHint(false);
        setSessionAttempts([]); // <-- Очищаем историю попыток для нового вопроса
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

            // ДОБАВЛЯЕМ реальный ответ пользователя в историю сессии
            setSessionAttempts((prev) => [
            ...prev,
            {
                attempt: response.attemptsCount,
                value: variables.answerText, // <-- Берем текст из запроса
                correct: response.correct,
            },
            ]);

            queryClient.invalidateQueries({ queryKey });
        },
    });

    const submitAnswer = useCallback(async () => {
        if (!answer.trim() || !currentItem) return;
        await submitMutation.mutateAsync({ itemId: currentItem.id, answerText: answer.trim() });
    }, [answer, currentItem, submitMutation]);

    const nextItem = useCallback(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [queryClient, queryKey]);

    const completeMutation = useMutation({
        mutationFn: () => StudentWorkService.completeWork(workId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'work', workId, 'report'] });
        },
    });

    const completeWork = useCallback(async () => {
        await completeMutation.mutateAsync();
    }, [completeMutation]);

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
        showHint,
        toggleHint: useCallback(() => setShowHint((p) => !p), []),
        answer,
        setAnswer,
        feedback: lastFeedback,
        startWork,
        submitAnswer,
        nextItem,
        completeWork,
        isSubmitting: submitMutation.isPending,
        isCompleting: completeMutation.isPending,
    };
}