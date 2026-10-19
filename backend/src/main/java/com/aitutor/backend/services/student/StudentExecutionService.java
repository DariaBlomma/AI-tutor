package com.aitutor.backend.services.student;

import com.aitutor.backend.dto.student.StudentItemProgressDto;
import com.aitutor.backend.dto.student.StudentTaskItemDto;
import com.aitutor.backend.dto.student.StudentWorkDetailResponse;
import com.aitutor.backend.entities.StudentWork;
import com.aitutor.backend.entities.StudentWorkItemProgress;
import com.aitutor.backend.entities.TaskItem;
import com.aitutor.backend.enums.ItemProgressStatus;
import com.aitutor.backend.enums.WorkStatus;
import com.aitutor.backend.exceptions.InvalidRequestException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.repositories.StudentWorkItemProgressRepository;
import com.aitutor.backend.repositories.StudentWorkRepository;
import lombok.RequiredArgsConstructor;
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
 * Экран выполнения задания учеником: старт работы и выдача полного контента.
 * Безопасность: correctAnswer НИКОГДА не попадает в ответ клиенту — эталонные ответы
 * остаются на бэкенде и передаются только ИИ (сервер-сервер, Этап 4).
 */
@Service
@RequiredArgsConstructor
public class StudentExecutionService {

    private final StudentWorkRepository studentWorkRepository;
    private final StudentWorkItemProgressRepository progressRepository;

    /**
     * Старт выполнения: ASSIGNED → IN_PROGRESS, startedAt фиксируется один раз.
     * Идемпотентно: повторный вызов для IN_PROGRESS просто возвращает карточку.
     * Строки прогресса создаются лениво при первом ответе по пункту (Этап 3),
     * поэтому здесь их не трогаем.
     */
    @Transactional
    public StudentWorkDetailResponse start(Long studentId, Long workId) {
        StudentWork work = loadOwnedWork(studentId, workId);
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

    /** Работа существует, не удалена и принадлежит именно этому ученику. */
    private StudentWork loadOwnedWork(Long studentId, Long workId) {
        StudentWork work = studentWorkRepository.findByIdAndDeletedAtIsNull(workId)
                .orElseThrow(() -> new ResourceNotFoundException("Назначение не найдено: id=" + workId));
        if (!work.getStudent().getId().equals(studentId)) {
            throw new AccessDeniedException("Назначение принадлежит другому ученику");
        }
        return work;
    }

    private StudentWorkDetailResponse buildDetail(StudentWork work) {
        // Пункты живого задания, упорядоченные по position (soft-delete есть у Task, а не у TaskItem).
        if (work.getTask().getDeletedAt() != null) {
            throw new InvalidRequestException("Задание удалено учителем, выполнение недоступно");
        }
        List<TaskItem> items = work.getTask().getItems().stream()
                .sorted(Comparator.comparing(TaskItem::getPosition,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        Map<Long, StudentWorkItemProgress> byItemId = progressRepository
                .findByWorkIdWithItem(work.getId()).stream()
                .collect(Collectors.toMap(p -> p.getTaskItem().getId(), Function.identity()));

        return StudentWorkDetailResponse.builder()
                .workId(work.getId())
                .taskId(work.getTask().getId())
                .taskPublicId(work.getTask().getPublicId())
                .taskName(work.getTask().getName())
                .status(work.getStatus())
                .deadline(work.getDeadline())
                .startedAt(work.getStartedAt())
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
                    .lastAnswer(null)
                    .build();
        }
        return StudentItemProgressDto.builder()
                .taskItemId(item.getId())
                .status(progress.getStatus())
                .answerAttempts(progress.getAnswerAttempts())
                .hintsGiven(progress.getHintsGiven())
                .lastAnswer(progress.getStudentAnswer())
                .build();
    }
}
