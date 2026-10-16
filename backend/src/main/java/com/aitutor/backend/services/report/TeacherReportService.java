package com.aitutor.backend.services.report;

import com.aitutor.backend.dto.report.StudentReportSummaryDto;
import com.aitutor.backend.dto.report.StudentWorkReportItemDto;
import com.aitutor.backend.dto.report.WorkItemAnswerDto;
import com.aitutor.backend.dto.report.WorkReportDetailDto;
import com.aitutor.backend.entities.StudentProfile;
import com.aitutor.backend.entities.StudentWork;
import com.aitutor.backend.entities.StudentWorkItemProgress;
import com.aitutor.backend.entities.Task;
import com.aitutor.backend.entities.TaskItem;
import com.aitutor.backend.entities.TaskType;
import com.aitutor.backend.entities.Topic;
import com.aitutor.backend.entities.User;
import com.aitutor.backend.enums.WorkStatus;
import com.aitutor.backend.exceptions.ConflictException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.repositories.StudentProfileRepository;
import com.aitutor.backend.repositories.StudentWorkItemProgressRepository;
import com.aitutor.backend.repositories.StudentWorkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * Отчёты учителя (только чтение, без оценок):
 * уровень 1 — сводка по всем своим ученикам (только активные назначения);
 * уровень 2 — лента работ конкретного ученика со всеми статусами и фильтром по дате завершения;
 * уровень 3 — детали ВЫПОЛНЕННОЙ работы: текст задания с эталонами + финальные ответы ученика.
 * Права: жёсткая привязка ученик ↔ один учитель, проверяем через student_profiles.teacher_id.
 */
@Service
@RequiredArgsConstructor
public class TeacherReportService {

    private final StudentWorkRepository studentWorkRepository;
    private final StudentWorkItemProgressRepository progressRepository;
    private final StudentProfileRepository studentProfileRepository;

    /** Уровень 1: вкладка «Отчёты» — все свои ученики + счётчики только активных назначений. */
    @Transactional(readOnly = true)
    public List<StudentReportSummaryDto> getReportsOverview(Long teacherId) {
        return studentProfileRepository.findByTeacherId(teacherId).stream()
                .map(this::toSummary)
                .sorted(Comparator.comparing(StudentReportSummaryDto::getStudentName,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .toList();
    }

    /**
     * Уровень 2: карточка ученика — все его работы (дубль студенческого интерфейса).
     * from/to фильтруют по completed_at (пресеты «неделя/месяц» конвертирует фронт).
     */
    @Transactional(readOnly = true)
    public List<StudentWorkReportItemDto> getStudentWorkFeed(Long teacherId, Long studentId,
                                                             WorkStatus status,
                                                             Instant from, Instant to) {
        assertTeacherOwnsStudent(teacherId, studentId);
        if (from != null && to != null && from.isAfter(to)) {
            throw new ConflictException("Начало периода не может быть позже конца");
        }
        List<StudentWork> works = studentWorkRepository
                .findByStudentIdAndDeletedAtIsNullOrderByCreatedAtDesc(studentId).stream()
                .filter(w -> status == null || w.getStatus() == status)
                .filter(w -> withinCompletedPeriod(w, from, to))
                .toList();
        return works.stream().map(this::toFeedItem).toList();
    }

    /**
     * Уровень 3: детали выполненной работы. Смотреть прогресс можно только по COMPLETED —
     * на любую другую работу 409 (по решению заказчика).
     */
    @Transactional(readOnly = true)
    public WorkReportDetailDto getWorkDetails(Long teacherId, Long studentId, Long workId) {
        assertTeacherOwnsStudent(teacherId, studentId);
        StudentWork work = studentWorkRepository.findByIdAndDeletedAtIsNull(workId)
                .orElseThrow(() -> new ResourceNotFoundException("Назначение не найдено: id=" + workId));
        if (!work.getStudent().getId().equals(studentId)) {
            // Работа принадлежит другому ученику — не раскрываем чужие данные.
            throw new ResourceNotFoundException("Работа не найдена у этого ученика: id=" + workId);
        }
        if (work.getStatus() != WorkStatus.COMPLETED) {
            throw new ConflictException("Детали доступны только для выполненных работ. Текущий статус: "
                    + work.getStatus());
        }

        Task task = work.getTask();
        List<StudentWorkItemProgress> progresses = progressRepository.findByWorkIdWithItem(workId);
        int errors = countFinalErrors(progresses);

        List<WorkItemAnswerDto> items = progresses.stream()
                .sorted(Comparator.comparing(p -> p.getTaskItem().getPosition()))
                .map(p -> toItemAnswer(p, p.getTaskItem()))
                .toList();

        return WorkReportDetailDto.builder()
                .workId(work.getId())
                .studentId(work.getStudent().getId())
                .studentName(displayName(work.getStudent()))
                .taskId(task.getId())
                .taskPublicId(task.getPublicId())
                .taskName(task.getName())
                .topics(topicNames(task.getTopics()))
                .taskTypes(taskTypeNames(task.getTaskTypes()))
                .isMixed(task.getIsMixed())
                .context(task.getContext())
                .startedAt(work.getStartedAt())
                .completedAt(work.getCompletedAt())
                .durationSeconds(durationSeconds(work))
                .errorsCount(errors)
                .items(items)
                // Комментарий ИИ: поле в DTO есть, значение всегда null до подключения AI-сервиса.
                .aiComment(null)
                .build();
    }

    // ---------- helpers ----------

    private StudentReportSummaryDto toSummary(StudentProfile profile) {
        User student = profile.getUser();
        List<StudentWork> active = studentWorkRepository
                .findByStudentIdAndDeletedAtIsNullOrderByCreatedAtDesc(student.getId()).stream()
                .filter(StudentWork::isActive)
                .toList();
        int inProgress = (int) active.stream()
                .filter(w -> w.getStatus() == WorkStatus.IN_PROGRESS)
                .count();
        return StudentReportSummaryDto.builder()
                .studentId(student.getId())
                .studentName(displayName(student))
                .email(student.getEmail())
                .assignedCount(active.size())
                .inProgressCount(inProgress)
                .build();
    }

    private StudentWorkReportItemDto toFeedItem(StudentWork work) {
        Task task = work.getTask();
        boolean completed = work.getStatus() == WorkStatus.COMPLETED;
        Integer errors = completed
                ? countFinalErrors(progressRepository.findByWorkIdWithItem(work.getId()))
                : null;
        return StudentWorkReportItemDto.builder()
                .workId(work.getId())
                .taskId(task.getId())
                .taskPublicId(task.getPublicId())
                .taskName(task.getName())
                .topics(topicNames(task.getTopics()))
                .taskTypes(taskTypeNames(task.getTaskTypes()))
                .isMixed(task.getIsMixed())
                .status(work.getStatus())
                .deadline(work.getDeadline())
                .assignedAt(work.getCreatedAt())
                .startedAt(work.getStartedAt())
                .completedAt(work.getCompletedAt())
                .durationSeconds(completed ? durationSeconds(work) : null)
                .errorsCount(errors)
                .build();
    }

    private WorkItemAnswerDto toItemAnswer(StudentWorkItemProgress progress, TaskItem item) {
        String correct = item.getCorrectAnswer();
        String answer = progress.getStudentAnswer();
        boolean isCorrect = correct != null && answer != null
                && correct.trim().equalsIgnoreCase(answer.trim());
        return WorkItemAnswerDto.builder()
                .taskItemId(item.getId())
                .position(item.getPosition())
                .itemType(item.getItemType().name())
                .prompt(item.getPrompt())
                .content(item.getContent())
                .correctAnswer(correct)
                .studentAnswer(answer)
                .correct(isCorrect)
                .attemptsCount(progress.getAnswerAttempts())
                .hintsGiven(progress.getHintsGiven())
                .build();
    }

    /** Ошибки для превью: позиции, где ФИНАЛЬНЫЙ ответ ученика не совпал с эталоном. */
    private int countFinalErrors(List<StudentWorkItemProgress> progresses) {
        return (int) progresses.stream()
                .filter(p -> {
                    String correct = p.getTaskItem().getCorrectAnswer();
                    String answer = p.getStudentAnswer();
                    return correct != null && (answer == null
                            || !correct.trim().equalsIgnoreCase(answer.trim()));
                })
                .count();
    }

    /** Длительность сессии: нажал «Выполнять» (started_at) → «Завершить» (completed_at), секунды. */
    private Long durationSeconds(StudentWork work) {
        if (work.getStartedAt() == null || work.getCompletedAt() == null) {
            return null;
        }
        return Duration.between(work.getStartedAt(), work.getCompletedAt()).getSeconds();
    }

    private boolean withinCompletedPeriod(StudentWork work, Instant from, Instant to) {
        if (from == null && to == null) {
            return true;
        }
        Instant completedAt = work.getCompletedAt();
        if (completedAt == null) {
            return false; // фильтр по датам применяется к ленте выполненных
        }
        return (from == null || !completedAt.isBefore(from))
                && (to == null || !completedAt.isAfter(to));
    }

    private void assertTeacherOwnsStudent(Long teacherId, Long studentId) {
        boolean owns = studentProfileRepository.findByTeacherId(teacherId).stream()
                .anyMatch(p -> p.getUser().getId().equals(studentId));
        if (!owns) {
            throw new AccessDeniedException("Ученик не привязан к этому учителю: id=" + studentId);
        }
    }

    private List<String> topicNames(Set<Topic> topics) {
        return topics.stream().map(Topic::getName).sorted().toList();
    }

    private List<String> taskTypeNames(Set<TaskType> types) {
        return types.stream().map(TaskType::getName).sorted().toList();
    }

    private String displayName(User user) {
        String full = ((user.getFirstName() == null ? "" : user.getFirstName()) + " "
                + (user.getLastName() == null ? "" : user.getLastName())).trim();
        return full.isEmpty() ? user.getUserName() : full;
    }
}
