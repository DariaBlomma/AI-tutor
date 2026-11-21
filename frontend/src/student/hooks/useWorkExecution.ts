import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentWorkService } from '@/student/services/StudentWorkService';
import { extractErrorMessage } from '@/core/api/utils/errors';
import type {
    StudentWorkDetailResponse,
    StudentSubmitAnswerRequest,
    StudentSubmitAnswerResponse,
    ItemProgressStatus,
} from '@/student/types/work';

/** Состояние фидбека после проверки ответа. */
export interface FeedbackState {
    correct: boolean;
    attemptsCount: number;
    hint: string | null;
    allItemsSolved: boolean;
}

/** Предыдущий ответ на текущем пункте. */
export interface PreviousAnswer {
    attempt: number;
    value: string;
    correct: boolean;
}

export interface UseWorkExecutionResult {
    /** Детальная информация о работе. */
    workDetail: StudentWorkDetailResponse | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;

    /** Индекс текущего пункта. */
    currentItemIndex: number;
    /** Текущий пункт (null если все решены). */
    currentItem: StudentWorkDetailResponse['items'][number] | null;
    /** Общее количество пунктов. */
    totalItems: number;
    /** Количество решённых пунктов. */
    solvedItems: number;
    /** Прошедшие секунды с начала работы. */
    elapsedSeconds: number;
    /** Предыдущие ответы на текущем пункте. */
    previousAnswers: PreviousAnswer[];
    /** Показать подсказку. */
    showHint: boolean;
    /** Переключить подсказку. */
    toggleHint: () => void;

    /** Текст ответа студента. */
    answer: string;
    setAnswer: (value: string) => void;

    /** Фидбек после последней проверки (null = нет фидбека). */
    feedback: FeedbackState | null;
    setFeedback: (fb: FeedbackState | null) => void;

    /** Мутации. */
    startWork: () => Promise<void>;
    submitAnswer: () => Promise<void>;
    nextItem: () => void;
    completeWork: () => Promise<void>;
    isSubmitting: boolean;
    isCompleting: boolean;
}

/** Вычисляет текущий пункт из массива прогресса (первый нерешённый). */
function computeCurrentItemIndex(progress: Array<{ status: ItemProgressStatus }>): number {
    for (let i = 0; i < progress.length; i++) {
        if (progress[i].status !== 'SOLVED') {
            return i;
        }
    }
    return progress.length;
}

/** Вычисляет количество решённых пунктов. */
function computeSolvedItems(progress: Array<{ status: ItemProgressStatus }>): number {
    return progress.filter((p) => p.status === 'SOLVED').length;
}

/**
 * Хук для управления выполнением работы студентом.
 * При монтировании автоматически стартует работу (если не начата).
 * Управляет состоянием текущего пункта, ответами, фидбеком и навигацией.
 */
export function useWorkExecution(workId: number): UseWorkExecutionResult {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Состояние ответа и фидбека
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [previousAnswers, setPreviousAnswers] = useState<PreviousAnswer[]>([]);
    const [showHint, setShowHint] = useState(false);

    // Загрузка work detail
    const { data: workDetail, isLoading, isError, error } = useQuery({
        queryKey: ['student', 'work', workId],
        queryFn: () => StudentWorkService.getWorkDetail(workId),
        staleTime: 0,
        retry: false,
    });

    // Вычисляемые значения из прогресса
    const totalItems = workDetail?.items.length ?? 0;
    const solvedItems = workDetail ? computeSolvedItems(workDetail.progress) : 0;
    const [currentItemIndex, setCurrentItemIndex] = useState(
        workDetail ? computeCurrentItemIndex(workDetail.progress) : 0,
    );

    // Ref для актуальных значений мутации — замыкание mutationFn берёт из ref, а не из render-scope
    const workDetailRef = useRef(workDetail);
    const currentItemIndexRef = useRef(currentItemIndex);
    useEffect(() => { workDetailRef.current = workDetail; }, [workDetail]);
    useEffect(() => { currentItemIndexRef.current = currentItemIndex; }, [currentItemIndex]);

    // Elapsed time с начала работы
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    useEffect(() => {
        if (!workDetail?.startedAt) return;
        const start = new Date(workDetail.startedAt).getTime();
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [workDetail?.startedAt]);

    // Toggle hint
    const toggleHint = useCallback(() => {
        setShowHint((prev) => !prev);
    }, []);

    // Автостарт при монтировании
    const startMutation = useMutation({
        mutationFn: () => StudentWorkService.startWork(workId),
        onSuccess: (data) => {
            setCurrentItemIndex(computeCurrentItemIndex(data.progress));
        },
    });

    const startWork = useCallback(async () => {
        if (!startMutation.data && !startMutation.isPending) {
            await startMutation.mutateAsync();
        }
    }, [startMutation]);

    // Обновляем currentItemIndex когда workDetail изменился (например, после submit)
    useEffect(() => {
        if (workDetail) {
            setCurrentItemIndex(computeCurrentItemIndex(workDetail.progress));
        }
    }, [workDetail]);

    // Submit answer
    const submitMutation = useMutation({
        mutationFn: (data: StudentSubmitAnswerRequest) => {
            const currentItem = workDetailRef.current?.items[currentItemIndexRef.current];
            if (!currentItem) throw new Error('Current item not found');
            return StudentWorkService.submitAnswer(workId, currentItem.id, data);
        },
        onSuccess: (response: StudentSubmitAnswerResponse, variables) => {
            // Добавляем ответ в историю ТОЛЬКО после успешного ответа бэка, с правильным флагом
            setPreviousAnswers((prev) => [
                ...prev,
                {
                    attempt: prev.length + 1,
                    value: variables.answer,
                    correct: response.correct,
                },
            ]);

            setFeedback({
                correct: response.correct,
                attemptsCount: response.attemptsCount,
                hint: response.hint ?? null,
                allItemsSolved: response.allItemsSolved,
            });

            // Если все пункты решены — редиректим на результаты (completeWork вызовется из view)
            // Redirection handled by view useEffect when allItemsSolved
        },
    });

    const submitAnswer = useCallback(async () => {
        if (!answer.trim()) return;
        await submitMutation.mutateAsync({ answer: answer.trim() });
    }, [answer, submitMutation]);

    // Next item
    const nextItem = useCallback(() => {
        // Очищаем состояние ДО смены индекса, чтобы не было флеша старого
        setPreviousAnswers([]);
        setAnswer('');
        setFeedback(null);
        setShowHint(false);
        setCurrentItemIndex((prev) => prev + 1);
    }, []);

    // Навигация на результаты когда все пункты решены
    useEffect(() => {
        if (workDetail && currentItemIndex >= workDetail.items.length) {
            navigate({
                to: '/student/work/$workId/report',
                params: { workId: String(workId) },
            });
        }
    }, [currentItemIndex, workDetail, navigate, workId]);

    const workIdRef = useRef(workId);
    useEffect(() => { workIdRef.current = workId; }, [workId]);

    // Complete work
    const completeMutation = useMutation({
        mutationFn: () => StudentWorkService.completeWork(workIdRef.current),
        onSuccess: () => {
            // Инвалидируем query дашборда, чтобы обновить статус и статистику
            queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
        },
    });

    const completeWork = useCallback(async () => {
        await completeMutation.mutateAsync();
    }, [completeMutation]);

    // Сброс состояния при смене пункта
    useEffect(() => {
        setAnswer('');
        setFeedback(null);
    }, [currentItemIndex]);

    // Текущий пункт
    const currentItem = workDetail?.items[currentItemIndex] ?? null;

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
        showHint,
        toggleHint,
        answer,
        setAnswer,
        feedback,
        setFeedback,
        startWork,
        submitAnswer,
        nextItem,
        completeWork,
        isSubmitting: submitMutation.isPending,
        isCompleting: completeMutation.isPending,
    };
}
