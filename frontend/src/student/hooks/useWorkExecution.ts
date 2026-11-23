import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentWorkService } from '@/student/services/StudentWorkService';
import { extractErrorMessage } from '@/core/api/utils/errors';
import type {
StudentWorkDetailResponse,
StudentSubmitAnswerRequest,
StudentSubmitAnswerResponse,
ItemProgressStatus,
} from '@/student/types/work';

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

    // 1. ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ
    const { data: workDetail, isLoading, isError, error } = useQuery({
        queryKey,
        queryFn: () => StudentWorkService.getWorkDetail(workId),
        staleTime: 0,
        retry: false,
    });

    const totalItems = workDetail?.items.length ?? 0;

    // Вычисляем индекс динамически. Никаких useState для синхронизации с сервером!
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

    // История попыток вычисляется "на лету" из прогресса
    const previousAnswers = useMemo<PreviousAnswer[]>(() => {
        if (!currentProgress || currentProgress.answerAttempts === 0) return [];

        const answers: PreviousAnswer[] = [];
        for (let i = 1; i < currentProgress.answerAttempts; i++) {
            answers.push({ attempt: i, value: '***', correct: false });
        }
        if (currentProgress.lastAnswer) {
            answers.push({
                attempt: currentProgress.answerAttempts,
                value: currentProgress.lastAnswer,
                correct: false,
            });
        }
        return answers;
    }, [currentProgress]);

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

    // 2. ЛОКАЛЬНЫЙ СТЕЙТ ТОЛЬКО ДЛЯ UI-ФОРМЫ
    const [answer, setAnswer] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [lastFeedback, setLastFeedback] = useState<FeedbackState | null>(null);

    // БЕЗОПАСНЫЙ сброс формы при переходе к новому вопросу
    useEffect(() => {
        setAnswer('');
        setLastFeedback(null);
        setShowHint(false);
    }, [currentItemIndex]);

    // Таймер с корректным интервалом
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() => {
        if (!workDetail?.startedAt) return;
        const start = new Date(workDetail.startedAt).getTime();

        // Устанавливаем сразу, чтобы не ждать 1 секунду до первого тика
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));

        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [workDetail?.startedAt]);

    // 3. МУТАЦИИ (без useRef, передаем данные явно через аргументы)
    const startMutation = useMutation({
        mutationFn: () => StudentWorkService.startWork(workId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const startWork = useCallback(async () => {
        // Не стартуем, если уже начата или идет процесс
        if (workDetail?.startedAt) return;
        if (!startMutation.isPending && !startMutation.data) {
            await startMutation.mutateAsync();
        }
    }, [workDetail?.startedAt, startMutation]);

    const submitMutation = useMutation({
        // Передаем itemId явно, чтобы избежать stale closure
        mutationFn: ({ itemId, answerText }: { itemId: number; answerText: string }) => {
            return StudentWorkService.submitAnswer(workId, itemId, { answer: answerText });
        },
        onSuccess: (response) => {
            setLastFeedback({
                correct: response.correct,
                attemptsCount: response.attemptsCount,
                hint: response.hint ?? null,
                allItemsSolved: response.allItemsSolved,
            });
            // Инвалидация заставит пересчитать currentItemIndex, если ответ был верным
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const submitAnswer = useCallback(async () => {
        if (!answer.trim() || !currentItem) return;
        await submitMutation.mutateAsync({ itemId: currentItem.id, answerText: answer.trim() });
    }, [answer, currentItem, submitMutation]);

    const nextItem = useCallback(() => {
        // Принудительно обновляем данные. Если ответ был верным, сервер уже
        // пометил элемент как SOLVED, и следующий запрос вернет новый currentItemIndex.
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