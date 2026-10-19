package com.aitutor.backend.services.student;

import com.aitutor.backend.dto.student.AssignTasksRequest;
import com.aitutor.backend.dto.student.AssignmentResultResponse;
import com.aitutor.backend.dto.student.StudentProgressOverviewResponse;
import com.aitutor.backend.dto.student.StudentWorkResponse;
import com.aitutor.backend.entities.StudentProfile;
import com.aitutor.backend.entities.StudentWork;
import com.aitutor.backend.entities.Task;
import com.aitutor.backend.entities.User;
import com.aitutor.backend.enums.UserRole;
import com.aitutor.backend.enums.WorkStatus;
import com.aitutor.backend.exceptions.InvalidRequestException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.repositories.StudentProfileRepository;
import com.aitutor.backend.repositories.StudentWorkItemProgressRepository;
import com.aitutor.backend.repositories.StudentWorkRepository;
import com.aitutor.backend.repositories.task.TaskRepository;
import com.aitutor.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Назначение конкретных заданий конкретным ученикам (учитель) и просмотр
 * своих назначений (ученик). Курс здесь не участвует — это папка для учителя,
 * фронт разворачивает её состав в taskIds сам. Оценок нет: только статус и дедлайн.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudentWorkService {

    private final StudentWorkRepository studentWorkRepository;
    private final StudentWorkItemProgressRepository progressRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    /**
     * Пакетное назначение: декартово произведение ученики × задания в одной транзакции.
     * Дубли (уже есть АКТИВНОЕ назначение той же пары) молча пропускаются;
     * повтор разрешён, если предыдущее COMPLETED / EXPIRED / CANCELLED.
     */
    @Transactional
    public AssignmentResultResponse assign(Long teacherId, AssignTasksRequest request) {
        if (request.isDeadlineInPast()) {
            throw new InvalidRequestException("Дедлайн не может быть в прошлом");
        }

        List<Long> studentIds = distinct(request.getStudentIds());
        List<Long> taskIds = distinct(request.getTaskIds());

        // Права: жёсткая привязка ученик ↔ один учитель, поэтому assigned_by не храним —
        // проверяем, что все ученики числятся за этим учителем в student_profiles.
        Map<Long, StudentProfile> profilesByUserId = studentProfileRepository.findByTeacherId(teacherId)
                .stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity()));
        for (Long studentId : studentIds) {
            if (!profilesByUserId.containsKey(studentId)) {
                throw new AccessDeniedException("Ученик не привязан к этому учителю: id=" + studentId);
            }
        }

        List<Task> tasks = taskRepository.findAllById(taskIds);
        if (tasks.size() != taskIds.size()) {
            throw new ResourceNotFoundException("Некоторые задания не найдены в банке");
        }
        for (Task task : tasks) {
            if (task.getDeletedAt() != null) {
                throw new InvalidRequestException("Нельзя назначить удалённое задание: id=" + task.getId());
            }
        }

        int created = 0;
        int skipped = 0;
        List<StudentWork> toSave = new ArrayList<>();
        for (Long studentId : studentIds) {
            User student = userRepository.findActiveById(studentId)
                    .filter(u -> u.getRole() == UserRole.STUDENT)
                    .orElseThrow(() -> new InvalidRequestException("Ученик не найден или удалён: id=" + studentId));

            Set<Long> alreadyActive = studentWorkRepository.findActiveTaskIds(studentId, taskIds);
            skipped += alreadyActive.size();

            for (Task task : tasks) {
                if (alreadyActive.contains(task.getId())) {
                    continue;
                }
                toSave.add(StudentWork.builder()
                        .student(student)
                        .task(task)
                        .status(WorkStatus.ASSIGNED)
                        .deadline(request.getDeadline())
                        .build());
                created++;
            }
        }
        studentWorkRepository.saveAll(toSave);
        return AssignmentResultResponse.builder()
                .createdCount(created)
                .skippedDuplicateCount(skipped)
                .build();
    }

    /** Отмена назначения учителем: статус CANCELLED (запись остаётся как история), права — через профиль ученика. */
    @Transactional
    public StudentWorkResponse cancel(Long teacherId, Long workId) {
        StudentWork work = studentWorkRepository.findByIdAndDeletedAtIsNull(workId)
                .orElseThrow(() -> new ResourceNotFoundException("Назначение не найдено: id=" + workId));
        assertTeacherOwnsStudent(teacherId, work.getStudent().getId());
        if (work.getStatus() != WorkStatus.ASSIGNED && work.getStatus() != WorkStatus.IN_PROGRESS) {
            throw new InvalidRequestException("Нельзя отменить назначение со статусом " + work.getStatus());
        }
        work.setStatus(WorkStatus.CANCELLED);
        return toResponse(work);
    }

    /** «Мои задания» ученика: все активные (не удалённые) назначения, свежие сверху. */
    @Transactional(readOnly = true)
    public List<StudentWorkResponse> getMyWork(Long studentId) {
        return studentWorkRepository.findByStudentIdAndDeletedAtIsNullOrderByCreatedAtDesc(studentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** Поля, по которым разрешена сортировка списка назначений (защита от произвольных полей). */
    private static final Map<String, String> SORT_WHITELIST = Map.of(
            "deadline", "deadline",
            "status", "status",
            "createdAt", "createdAt");
    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Пагинированный список работ ученика. Сортировка: sort — только из SORT_WHITELIST
     * (по умолчанию createdAt desc), direction — asc|desc (по умолчанию desc).
     * Второй ключ createdAt DESC — детерминированная раздача одинаковых значений.
     */
    @Transactional(readOnly = true)
    public Page<StudentWorkResponse> getMyWorkPage(Long studentId, int page, int size,
                                                   String sort, String direction) {
        String property = SORT_WHITELIST.get(sort == null ? "createdAt" : sort);
        if (property == null) {
            throw new InvalidRequestException("Недопустимое поле сортировки: " + sort
                    + ". Разрешено: " + SORT_WHITELIST.keySet());
        }
        Sort.Direction dir = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        // NULLS_LAST: работы без дедлайна не всплывают в начало списка.
        Sort.Order primary = Sort.Order.by(property).with(dir).nullsLast();
        Sort sortSpec = Sort.by(primary).and(Sort.by(Sort.Direction.DESC, "createdAt"));
        PageRequest request = PageRequest.of(Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE), sortSpec);
        return studentWorkRepository.findByStudentIdAndDeletedAtIsNull(studentId, request)
                .map(this::toResponse);
    }

    /** Список назначений конкретного своего ученика — базовый строительный блок будущих отчётов. */
    @Transactional(readOnly = true)
    public List<StudentWorkResponse> getStudentWork(Long teacherId, Long studentId) {
        assertTeacherOwnsStudent(teacherId, studentId);
        return getMyWork(studentId);
    }

    /**
     * Краткий прогресс ученика («2 из 5») по АКТИВНЫМ назначениям: ASSIGNED / IN_PROGRESS.
     * COMPLETED / EXPIRED / CANCELLED не учитываются — только то, что актуально по времени
     * (просроченные работы фоновая задача заранее переводит в EXPIRED).
     * totalItems — суммарное число пунктов во всех активных работах (считается по живому
     * контенту заданий, т.к. строки прогресса создаются лениво); solvedItems — SOLVED-пункты.
     */
    @Transactional(readOnly = true)
    public StudentProgressOverviewResponse getProgressOverview(Long studentId) {
        List<StudentWork> activeWorks = studentWorkRepository.findActiveByStudent(studentId);
        if (activeWorks.isEmpty()) {
            return StudentProgressOverviewResponse.builder()
                    .totalActiveWorks(0).worksFullySolved(0)
                    .totalItems(0).solvedItems(0).hintsUsed(0)
                    .build();
        }

        List<Long> workIds = activeWorks.stream().map(StudentWork::getId).toList();
        Map<Long, StudentWorkItemProgressRepository.WorkProgressAggregate> aggByWork =
                progressRepository.aggregateByWorkIds(workIds).stream()
                        .collect(Collectors.toMap(
                                StudentWorkItemProgressRepository.WorkProgressAggregate::getWorkId,
                                Function.identity()));

        int totalItems = 0;
        int solvedItems = 0;
        int hintsUsed = 0;
        int worksFullySolved = 0;
        for (StudentWork work : activeWorks) {
            int itemsInWork = work.getTask().getItems().size();
            var agg = aggByWork.get(work.getId());
            int solved = agg == null ? 0 : intOf(agg.getSolvedCount());
            totalItems += itemsInWork;
            solvedItems += solved;
            hintsUsed += agg == null ? 0 : intOf(agg.getHintsUsed());
            // Работа «закрыта», когда все её пункты решены (complete ещё можно не нажимать).
            if (itemsInWork > 0 && solved >= itemsInWork) {
                worksFullySolved++;
            }
        }

        return StudentProgressOverviewResponse.builder()
                .totalActiveWorks(activeWorks.size())
                .worksFullySolved(worksFullySolved)
                .totalItems(totalItems)
                .solvedItems(solvedItems)
                .hintsUsed(hintsUsed)
                .build();
    }

    private static int intOf(Number value) {
        return value == null ? 0 : value.intValue();
    }

    /**
     * Автоперевод просроченных активных назначений в EXPIRED (фича дедлайнов).
     * Каждые 15 минут; массовый UPDATE — без загрузки сущностей в память.
     */
    @Scheduled(fixedDelayString = "PT15M")
    @Transactional
    public void expireOverdueAssignments() {
        int expired = studentWorkRepository.expireOverdue(Instant.now());
        if (expired > 0) {
            log.info("Авто-expired назначений с истёкшим дедлайном: {}", expired);
        }
    }

    private void assertTeacherOwnsStudent(Long teacherId, Long studentId) {
        boolean owns = studentProfileRepository.findByTeacherId(teacherId).stream()
                .anyMatch(p -> p.getUser().getId().equals(studentId));
        if (!owns) {
            throw new AccessDeniedException("Ученик не привязан к этому учителю: id=" + studentId);
        }
    }

    private StudentWorkResponse toResponse(StudentWork work) {
        Task task = work.getTask();
        return StudentWorkResponse.builder()
                .id(work.getId())
                .taskId(task.getId())
                .taskPublicId(task.getPublicId())
                .taskName(task.getName())
                .status(work.getStatus())
                .deadline(work.getDeadline())
                .assignedAt(work.getCreatedAt())
                .startedAt(work.getStartedAt())
                .completedAt(work.getCompletedAt())
                .build();
    }

    private static List<Long> distinct(List<Long> ids) {
        return new ArrayList<>(new HashSet<>(ids));
    }
}
