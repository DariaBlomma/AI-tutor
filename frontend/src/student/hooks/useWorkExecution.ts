import { useState, useEffect, useCallback, useRef } from 'react';
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

/** Результат ответа по пункту (для UI-окраски). */
export type ItemResult = 'correct' | 'incorrect' | null;

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
    /** Результат ответа по каждому пункту (для UI-окраски). */
    itemResults: ItemResult[];
    /** Количество оставшихся попыток на текущем пункте. */
    remainingAttempts: number;
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

/** Вычисляет текущий пункт из массива прогресса (первый нерешённый, пропускает SOLVED и FAILED). */
function computeCurrentItemIndex(progress: Array<{ status: ItemProgressStatus }>): number {
    for (let i = 0; i < progress.length; i++) {
        if (progress[i].status !== 'SOLVED' && progress[i].status !== 'FAILED') {
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
    const queryClient = useQueryClient();

    // Состояние ответа и фидбека
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [previousAnswers, setPreviousAnswers] = useState<PreviousAnswer[]>([]);
    const [itemResults, setItemResults] = useState<ItemResult[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(0);

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

    // Восстанавливаем previousAnswers из progress при загрузке workDetail или при смене currentItemIndex
    useEffect(() => {
        console.log('[useWorkExecution] useEffect для restore previousAnswers', {
            workDetailId: workDetail?.workId,
            currentItemIndex,
            progressLength: workDetail?.progress.length,
            progress: workDetail?.progress[currentItemIndex],
        });
        if (workDetail && workDetail.progress.length > 0 && currentItemIndex < workDetail.progress.length) {
            const currentProgress = workDetail.progress[currentItemIndex];
            console.log('[useWorkExecution] currentProgress:', currentProgress);
            if (currentProgress && currentProgress.answerAttempts > 0) {
                // Восстанавливаем историю попыток из progress
                // создаем массив previousAnswers с lastAnswer
                const restoredAnswers: PreviousAnswer[] = [];
                for (let i = 1; i < currentProgress.answerAttempts; i++) {
                    restoredAnswers.push({
                        attempt: i,
                        value: '',
                        correct: false,
                    });
                }
                // Добавляем последний ответ
                if (currentProgress.lastAnswer) {
                    restoredAnswers.push({
                        attempt: currentProgress.answerAttempts,
                        value: currentProgress.lastAnswer,
                        correct: currentProgress.answerAttempts === 3 ? false : false, // не знаем, верный или нет
                    });
                }
                console.log('[useWorkExecution] restoredAnswers:', restoredAnswers);
                setPreviousAnswers(restoredAnswers);
                // Оставшиеся попытки = 3 - answerAttempts
                setRemainingAttempts(Math.max(0, 3 - currentProgress.answerAttempts));
            } else {
                console.log('[useWorkExecution] no attempts or no currentProgress');
                setPreviousAnswers([]);
                setRemainingAttempts(3);
            }
        } else {
            console.log('[useWorkExecution] no workDetail or progress empty or index out of bounds');
        }
    }, [workDetail, currentItemIndex]);

    // Submit answer
    const submitMutation = useMutation({
        mutationFn: (data: StudentSubmitAnswerRequest) => {
            const currentItem = workDetailRef.current?.items[currentItemIndexRef.current];
            if (!currentItem) throw new Error('Current item not found');
            return StudentWorkService.submitAnswer(workId, currentItem.id, data);
        },
        onSuccess: (response: StudentSubmitAnswerResponse, variables) => {
            // Добавляем ответ в историю текущего пункта
            setPreviousAnswers((prev) => [
                ...prev,
                {
                    attempt: prev.length + 1,
                    value: variables.answer,
                    correct: response.correct,
                },
            ]);

            // Записываем результат для текущего пункта (для UI-окраски)
            // Не помечаем как incorrect сразу - только если исчерпаны попытки (attemptsCount >= 3) или верно
            setItemResults((prev) => {
                const next = [...prev];
                // Если верно - помечаем как correct
                if (response.correct) {
                    next[currentItemIndexRef.current] = 'correct';
                } else if (response.attemptsCount >= 3) {
                    // Если неверно и попытки исчерпаны (максимум 3) - помечаем как incorrect
                    next[currentItemIndexRef.current] = 'incorrect';
                }
                // Если неверно и попытки еще есть - оставляем null (не окрашиваем)
                return next;
            });

            setFeedback({
                correct: response.correct,
                attemptsCount: response.attemptsCount,
                hint: response.hint ?? null,
                allItemsSolved: response.allItemsSolved,
            });

            // Обновляем workDetail в кэше, чтобы прогресс-бар и done-класс обновились сразу
            queryClient.setQueryData(['student', 'work', workId], (old: StudentWorkDetailResponse | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    progress: old.progress.map((p) =>
                        p.taskItemId === response.taskItemId
                            ? { ...p, status: response.status as ItemProgressStatus }
                            : p,
                    ),
                };
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
        // Очищаем состояние текущего пункта, но сохраняем itemResults
        setPreviousAnswers([]);
        setAnswer('');
        setFeedback(null);
        setShowHint(false);
        setCurrentItemIndex((prev) => prev + 1);
        
        // Инвалидируем query workDetail, чтобы данные обновились при следующем пункте
        queryClient.invalidateQueries({ queryKey: ['student', 'work', workId] });
    }, [workId, queryClient]);

    const workIdRef = useRef(workId);
    useEffect(() => { workIdRef.current = workId; }, [workId]);

    // Complete work
    const completeMutation = useMutation({
        mutationFn: () => StudentWorkService.completeWork(workIdRef.current),
        onSuccess: (data) => {
            // Инвалидируем query дашборда и report, чтобы обновить статус и статистику
            queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'work'] });
        },
    });

    const completeWork = useCallback(async () => {
        return await completeMutation.mutateAsync();
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
        itemResults,
        remainingAttempts,
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
