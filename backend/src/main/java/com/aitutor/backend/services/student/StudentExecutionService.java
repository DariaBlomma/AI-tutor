package com.aitutor.backend.services.student;

import com.aitutor.backend.dto.student.StudentItemProgressDto;
import com.aitutor.backend.dto.student.StudentSubmitAnswerRequest;
import com.aitutor.backend.dto.student.StudentSubmitAnswerResponse;
import com.aitutor.backend.dto.student.StudentTaskItemDto;
import com.aitutor.backend.dto.student.StudentWorkCompleteResponse;
import com.aitutor.backend.dto.student.StudentWorkDetailResponse;
import com.aitutor.backend.dto.student.StudentWorkSummaryResponse;
import com.aitutor.backend.entities.StudentWork;
import com.aitutor.backend.entities.StudentWorkItemProgress;
import com.aitutor.backend.entities.TaskItem;
import com.aitutor.backend.enums.ItemProgressStatus;
import com.aitutor.backend.enums.WorkStatus;
import com.aitutor.backend.exceptions.ConflictException;
import com.aitutor.backend.exceptions.InvalidRequestException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.repositories.StudentWorkItemProgressRepository;
import com.aitutor.backend.repositories.StudentWorkRepository;
import com.aitutor.backend.services.student.checking.AnswerChecker;
import com.aitutor.backend.services.student.checking.CheckResult;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Экран выполнения задания учеником: жизненный цикл работы start → submit* → complete.
 * Безопасность: correctAnswer НИКОГДА не попадает в ответ клиенту — эталонные ответы
 * остаются на бэкенде и передаются только ИИ (сервер-сервер, Этап 4). Проверку ответа
 * выполняет бэкенд через стратегию {@link AnswerChecker} (сейчас ExactMatchChecker,
 * позже — AI-реализация того же интерфейса без изменения контракта).
 */
@Service
@RequiredArgsConstructor
public class StudentExecutionService {

    /** Бизнес-лимит подсказок на один пункт (формат Word Formation). */
    private static final int MAX_HINTS = 3;

    private final StudentWorkRepository studentWorkRepository;
    private final StudentWorkItemProgressRepository progressRepository;
    private final List<AnswerChecker> checkers;

    /**
     * Старт выполнения: ASSIGNED → IN_PROGRESS, startedAt фиксируется один раз.
     * Идемпотентно: повторный вызов для IN_PROGRESS просто возвращает карточку.
     * Строки прогресса создаются лениво при первом submit по пункту.
     */
    @Transactional
    public StudentWorkDetailResponse start(Long studentId, Long workId) {
        StudentWork work = loadOwnedWork(studentId, workId);
        assertNotTerminal(work);
        if (work.getStatus() == WorkStatus.ASSIGNED) {
            work.setStatus(WorkStatus.IN_PROGRESS);
            work.setStartedAt(Instant.now());
            studentWorkRepository.save(work);
        }
        return buildDetail(work);
    }

    /** Полный контент работы (без правильных ответов) + текущий прогресс по пунктам. */
    @Transactional(readOnly = true)
    public StudentWorkDetailResponse getDetail(Long studentId, Long workId) {
        return buildDetail(loadOwnedWork(studentId, workId));
    }

    /**
     * Фиксация результата проверки одного пункта: клиент присылает только ответ ученика
     * (+ опционально hintsUsed — будущий канал от ИИ-флоу), вердикт выносит бэкенд
     * (ExactMatchChecker; позже — та же точка входа для ИИ).
     * Повторная сдача по уже решённому пункту запрещена (409): решение финально,
     * попытки/статистика не мутируются задним числом.
     * При верном ответе — SOLVED; при исчерпании лимита подсказок — пункт тоже
     * закрывается SOLVED, но эталон НЕ выдаётся и в student_answer НЕ пишется
     * (статистика остаётся честной: видно расхождение с эталоном).
     */
    @Transactional
    public StudentSubmitAnswerResponse submit(Long studentId, Long workId, Long taskItemId,
                                              StudentSubmitAnswerRequest request) {
        StudentWork work = loadOwnedWork(studentId, workId);
        assertNotTerminal(work);
        TaskItem item = findItem(work, taskItemId);

        int hintsUsed = clampHints(request.getHintsUsed());
        StudentWorkItemProgress progress = findOrCreateProgress(work, item);

        // Пункт уже закрыт — защита от повторных попыток: решение финально.
        if (progress.getStatus() == ItemProgressStatus.SOLVED) {
            throw new ConflictException("Пункт уже решён, повторная сдача невозможна");
        }

        CheckResult result = pickChecker(item).check(item, request.getAnswer());

        int attempts = progress.getAnswerAttempts() + 1;
        progress.setAnswerAttempts(attempts);
        // Подсказки монотонны: берём максимум из переданного и уже учтённого.
        progress.setHintsGiven(Math.max(hintsUsed, nullToZero(progress.getHintsGiven())));
        // ВАЖНО: пишем именно ответ ученика (нормализованный), никогда не эталон —
        // иначе countFinalErrors в отчётах перестанет видеть ошибки.
        progress.setStudentAnswer(result.normalizedStudentAnswer());

        boolean hintLimitReached = progress.getHintsGiven() >= MAX_HINTS;
        if (result.correct()) {
            progress.setStatus(ItemProgressStatus.SOLVED);
            progress.setFirstTryCorrect(attempts == 1);
            progress.setSolvedAt(Instant.now());
        } else if (hintLimitReached) {
            // Исчерпаны все подсказки, ответ всё ещё неверный: пункт закрываем SOLVED
            // (решение по фиче), first_try_correct остаётся false — метрика не искажается.
            progress.setStatus(ItemProgressStatus.SOLVED);
            progress.setSolvedAt(Instant.now());
        } else {
            progress.setStatus(ItemProgressStatus.IN_PROGRESS);
        }
        saveProgress(progress);

        return StudentSubmitAnswerResponse.builder()
                .taskItemId(item.getId())
                .correct(result.correct())
                .status(progress.getStatus())
                .attemptsCount(progress.getAnswerAttempts())
                .hintsGiven(progress.getHintsGiven())
                // Сколько подсказок ещё можно запросить (0 — лимит исчерпан, дальше reveal).
                .hintsRemaining(Math.max(0, MAX_HINTS - progress.getHintsGiven()))
                .allItemsSolved(isAllSolved(work))
                .build();
    }

    /**
     * Завершение работы: статус COMPLETED, completedAt, агрегированная статистика
     * в student_work (first_try_correct / correct_after_hints / total_hints_given).
     * Разрешено только когда ВСЕ пункты закрыты (SOLVED) — флага force нет (решение по фиче).
     * Идемпотентно: повторный вызов возвращает уже сохранённую статистику.
     */
    @Transactional
    public StudentWorkCompleteResponse complete(Long studentId, Long workId) {
        StudentWork work = loadOwnedWork(studentId, workId);
        assertNotTerminal(work);

        if (work.getStatus() == WorkStatus.COMPLETED) {
            return toCompleteResponse(work);
        }
        if (work.getStatus() != WorkStatus.IN_PROGRESS) {
            throw new ConflictException("Нельзя завершить работу со статусом " + work.getStatus());
        }

        List<TaskItem> items = sortedItems(work);
        Map<Long, StudentWorkItemProgress> byItemId = progressByItem(work.getId());
        long solved = items.stream()
                .map(i -> byItemId.get(i.getId()))
                .filter(p -> p != null && p.getStatus() == ItemProgressStatus.SOLVED)
                .count();
        if (solved < items.size()) {
            throw new ConflictException(
                    "Нельзя завершить работу: решено %d из %d пунктов".formatted(solved, items.size()));
        }

        List<StudentWorkItemProgress> solvedProgresses = items.stream()
                .map(i -> byItemId.get(i.getId()))
                .toList();
        work.setStatus(WorkStatus.COMPLETED);
        work.setCompletedAt(Instant.now());
        work.setFirstTryCorrect((int) solvedProgresses.stream()
                .filter(p -> Boolean.TRUE.equals(p.getFirstTryCorrect())).count());
        work.setCorrectAfterHints((int) solvedProgresses.stream()
                .filter(p -> !Boolean.TRUE.equals(p.getFirstTryCorrect())).count());
        work.setTotalHintsGiven(solvedProgresses.stream()
                .mapToInt(p -> nullToZero(p.getHintsGiven())).sum());
        studentWorkRepository.save(work);

        return toCompleteResponse(work);
    }

    /**
     * Итог работы для экрана «Результаты» ученика: готовые агрегаты из student_work
     * (записаны при complete) + длительность решения. Для незавершённой работы
     * статистика считается по текущему прогрессу, durationSeconds = null.
     */
    @Transactional(readOnly = true)
    public StudentWorkSummaryResponse getSummary(Long studentId, Long workId) {
        StudentWork work = loadOwnedWork(studentId, workId);

        List<TaskItem> items = sortedItems(work);
        Map<Long, StudentWorkItemProgress> byItemId = progressByItem(work.getId());
        List<StudentWorkItemProgress> progresses = items.stream()
                .map(i -> byItemId.get(i.getId()))
                .filter(java.util.Objects::nonNull)
                .toList();

        int totalItems = items.size();
        int solvedItems = (int) progresses.stream()
                .filter(p -> p.getStatus() == ItemProgressStatus.SOLVED).count();
        int firstTryCorrect;
        int correctAfterHints;
        int totalHintsGiven;
        if (work.getStatus() == WorkStatus.COMPLETED) {
            // Доверяем сохранённым при complete агрегатам — они финальны.
            firstTryCorrect = nullToZero(work.getFirstTryCorrect());
            correctAfterHints = nullToZero(work.getCorrectAfterHints());
            totalHintsGiven = nullToZero(work.getTotalHintsGiven());
        } else {
            firstTryCorrect = (int) progresses.stream()
                    .filter(p -> Boolean.TRUE.equals(p.getFirstTryCorrect())).count();
            correctAfterHints = (int) progresses.stream()
                    .filter(p -> p.getStatus() == ItemProgressStatus.SOLVED)
                    .filter(p -> !Boolean.TRUE.equals(p.getFirstTryCorrect())).count();
            totalHintsGiven = progresses.stream()
                    .mapToInt(p -> nullToZero(p.getHintsGiven())).sum();
        }

        Long durationSeconds = (work.getStartedAt() != null && work.getCompletedAt() != null)
                ? work.getCompletedAt().getEpochSecond() - work.getStartedAt().getEpochSecond()
                : null;

        return StudentWorkSummaryResponse.builder()
                .workId(work.getId())
                .taskName(work.getTask().getName())
                .status(work.getStatus())
                .startedAt(work.getStartedAt())
                .completedAt(work.getCompletedAt())
                .durationSeconds(durationSeconds)
                .totalItems(totalItems)
                .solvedItems(solvedItems)
                .firstTryCorrect(firstTryCorrect)
                .correctAfterHints(correctAfterHints)
                .totalHintsGiven(totalHintsGiven)
                .build();
    }

    // ---------- helpers ----------

    /** Работа существует, не удалена и принадлежит именно этому ученику. */
    private StudentWork loadOwnedWork(Long studentId, Long workId) {
        StudentWork work = studentWorkRepository.findByIdAndDeletedAtIsNull(workId)
                .orElseThrow(() -> new ResourceNotFoundException("Назначение не найдено: id=" + workId));
        if (!work.getStudent().getId().equals(studentId)) {
            throw new AccessDeniedException("Назначение принадлежит другому ученику");
        }
        return work;
    }

    /** EXPIRED / CANCELLED — терминальные состояния: start / submit / complete запрещены. */
    private void assertNotTerminal(StudentWork work) {
        if (work.getStatus() == WorkStatus.EXPIRED) {
            throw new ConflictException("Срок выполнения истёк, работа помечена EXPIRED");
        }
        if (work.getStatus() == WorkStatus.CANCELLED) {
            throw new ConflictException("Назначение отменено учителем");
        }
    }

    /** Пункт должен принадлежать заданию этой работы. */
    private TaskItem findItem(StudentWork work, Long taskItemId) {
        return work.getTask().getItems().stream()
                .filter(i -> i.getId().equals(taskItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Пункт не найден в этом задании: id=" + taskItemId));
    }

    /** Первая подходящая стратегия проверки (единственная реализация пока — ExactMatchChecker). */
    private AnswerChecker pickChecker(TaskItem item) {
        return checkers.stream()
                .filter(c -> c.supports(item))
                .findFirst()
                .orElseThrow(() -> new InvalidRequestException(
                        "Нет стратегии проверки для формата " + item.getItemType()));
    }

    /** Ленивое создание строки прогресса при первом submit; UNIQUE-конфликт гонки — перечитать. */
    private StudentWorkItemProgress findOrCreateProgress(StudentWork work, TaskItem item) {
        return progressRepository.findByWorkAndItem(work.getId(), item.getId())
                .orElseGet(() -> {
                    try {
                        StudentWorkItemProgress created = StudentWorkItemProgress.builder()
                                .studentWork(work)
                                .taskItem(item)
                                .status(ItemProgressStatus.NOT_STARTED)
                                .answerAttempts(0)
                                .hintsGiven(0)
                                .firstTryCorrect(false)
                                .build();
                        return progressRepository.saveAndFlush(created);
                    } catch (DataIntegrityViolationException race) {
                        return progressRepository.findByWorkAndItem(work.getId(), item.getId())
                                .orElseThrow(() -> new ConflictException(
                                        "Не удалось создать строку прогресса для пункта id=" + item.getId()));
                    }
                });
    }

    private void saveProgress(StudentWorkItemProgress progress) {
        progressRepository.save(progress);
    }

    private boolean isAllSolved(StudentWork work) {
        List<TaskItem> items = sortedItems(work);
        Map<Long, StudentWorkItemProgress> byItemId = progressByItem(work.getId());
        return items.stream().allMatch(i -> {
            StudentWorkItemProgress p = byItemId.get(i.getId());
            return p != null && p.getStatus() == ItemProgressStatus.SOLVED;
        });
    }

    private int clampHints(Integer hintsUsed) {
        if (hintsUsed == null || hintsUsed < 0) {
            return 0;
        }
        return Math.min(hintsUsed, MAX_HINTS);
    }

    private int nullToZero(Integer value) {
        return value == null ? 0 : value;
    }

    private StudentWorkCompleteResponse toCompleteResponse(StudentWork work) {
        int total = work.getTask().getItems().size();
        return StudentWorkCompleteResponse.builder()
                .workId(work.getId())
                .completedAt(work.getCompletedAt())
                .totalItems(total)
                .firstTryCorrect(nullToZero(work.getFirstTryCorrect()))
                .correctAfterHints(nullToZero(work.getCorrectAfterHints()))
                .totalHintsGiven(nullToZero(work.getTotalHintsGiven()))
                .build();
    }

    private List<TaskItem> sortedItems(StudentWork work) {
        // Пункты живого задания, упорядоченные по position (soft-delete есть у Task, а не у TaskItem).
        if (work.getTask().getDeletedAt() != null) {
            throw new InvalidRequestException("Задание удалено учителем, выполнение недоступно");
        }
        return work.getTask().getItems().stream()
                .sorted(Comparator.comparing(TaskItem::getPosition,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private Map<Long, StudentWorkItemProgress> progressByItem(Long workId) {
        return progressRepository.findByWorkIdWithItem(workId).stream()
                .collect(Collectors.toMap(p -> p.getTaskItem().getId(), Function.identity()));
    }

    private StudentWorkDetailResponse buildDetail(StudentWork work) {
        List<TaskItem> items = sortedItems(work);
        Map<Long, StudentWorkItemProgress> byItemId = progressByItem(work.getId());

        return StudentWorkDetailResponse.builder()
                .workId(work.getId())
                .taskId(work.getTask().getId())
                .taskPublicId(work.getTask().getPublicId())
                .taskName(work.getTask().getName())
                .status(work.getStatus())
                .deadline(work.getDeadline())
                .startedAt(work.getStartedAt())
                .completedAt(work.getCompletedAt())
                .items(items.stream().map(this::toItemDto).toList())
                .progress(items.stream().map(item -> toProgressDto(item, byItemId.get(item.getId()))).toList())
                .build();
    }

    private StudentTaskItemDto toItemDto(TaskItem item) {
        return StudentTaskItemDto.builder()
                .id(item.getId())
                .itemType(item.getItemType())
                .prompt(item.getPrompt())
                .content(item.getContent())
                .position(item.getPosition())
                .build();
    }

    /** Для пункта без начатой работы отдаём виртуальный NOT_STARTED с нулями. */
    private StudentItemProgressDto toProgressDto(TaskItem item, StudentWorkItemProgress progress) {
        if (progress == null) {
            return StudentItemProgressDto.builder()
                    .taskItemId(item.getId())
                    .status(ItemProgressStatus.NOT_STARTED)
                    .answerAttempts(0)
                    .hintsGiven(0)
                    .hintsRemaining(MAX_HINTS)
                    .lastAnswer(null)
                    .build();
        }
        return StudentItemProgressDto.builder()
                .taskItemId(item.getId())
                .status(progress.getStatus())
                .answerAttempts(progress.getAnswerAttempts())
                .hintsGiven(progress.getHintsGiven())
                .hintsRemaining(Math.max(0, MAX_HINTS - nullToZero(progress.getHintsGiven())))
                .lastAnswer(progress.getStudentAnswer())
                .build();
    }
}

