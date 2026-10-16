package com.aitutor.backend.services.task;

import com.aitutor.backend.dto.task.TaskCreateRequest;
import com.aitutor.backend.dto.task.TaskItemRequest;
import com.aitutor.backend.dto.task.TaskResponse;
import com.aitutor.backend.dto.task.TaskSummaryResponse;
import com.aitutor.backend.dto.task.TaskUpdateRequest;
import com.aitutor.backend.entities.Task;
import com.aitutor.backend.entities.TaskItem;
import com.aitutor.backend.entities.TaskType;
import com.aitutor.backend.entities.Topic;
import com.aitutor.backend.entities.User;
import com.aitutor.backend.exceptions.InvalidRequestException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.mappers.TaskMapper;
import com.aitutor.backend.repositories.TopicRepository;
import com.aitutor.backend.repositories.UserRepository;
import com.aitutor.backend.repositories.task.TaskRepository;
import com.aitutor.backend.repositories.task.TaskTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TopicRepository topicRepository;
    private final TaskTypeRepository taskTypeRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;
    private final TaskPreviewBuilder previewBuilder;
    private final TaskContentValidator contentValidator;

    /**
     * Лёгкий список банка заданий: без контента (items), только мета + превью.
     * Поддерживает фильтры: тип задания (строгий/с смешанными) и поиск по name/publicId.
     */
    @Transactional(readOnly = true)
    public List<TaskSummaryResponse> getAll(Long taskTypeId, boolean includeMixed, String search) {
        Specification<Task> spec = TaskSpecifications.notDeleted()
                .and(TaskSpecifications.byTaskType(taskTypeId, includeMixed))
                .and(TaskSpecifications.byNameOrPublicId(search));

        // Стабильный порядок для UI банка заданий: новые сверху
        return taskRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(taskMapper::toSummary)
                .toList();
    }

    /** Детальная карточка: полный контент (topics, taskTypes, items). */
    @Transactional(readOnly = true)
    public TaskResponse getById(Long id) {
        return taskMapper.toResponse(findActiveWithRelations(id));
    }

    @Transactional
    public TaskResponse create(TaskCreateRequest request, Long teacherId) {
        User teacher = userRepository.findActiveById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Учитель не найден: id=" + teacherId));

        validateContent(request.getContext(), request.getItems());

        Set<Topic> topics = resolveTopics(request.getTopicIds());
        Set<TaskType> taskTypes = resolveTaskTypes(request.getTaskTypeIds());

        Task task = Task.builder()
                .name(request.getName())
                .context(request.getContext())
                .createdBy(teacher)
                .topics(topics)
                .taskTypes(taskTypes)
                // Бизнес-правило: больше одного типа => задание "смешанное"
                .isMixed(taskTypes.size() > 1)
                .items(mapItems(request.getItems()))
                .build();

        task.setPreviewText(previewBuilder.build(task.getItems()));
        taskRepository.save(task);

        return getById(task.getId());
    }

    @Transactional
    public TaskResponse update(Long id, TaskUpdateRequest request, Long teacherId) {
        Task task = findOwnedActiveTask(id, teacherId);

        validateContent(request.getContext(), request.getItems());

        Set<Topic> topics = resolveTopics(request.getTopicIds());
        Set<TaskType> taskTypes = resolveTaskTypes(request.getTaskTypeIds());

        task.setName(request.getName());
        task.setContext(request.getContext());
        task.setTopics(topics);
        task.setTaskTypes(taskTypes);
        // TODO: продумать стратегию — нужно ли пересчитывать is_mixed,
        //  если один из типов задания был деактивирован (soft-delete справочника). Пока пересчитываем по текущему составу.
        task.setIsMixed(taskTypes.size() > 1);

        // Полная замена списка пунктов: отсутствующие в запросе удаляются через orphanRemoval
        task.getItems().clear();
        task.getItems().addAll(mapItems(request.getItems()));
        task.setPreviewText(previewBuilder.build(task.getItems()));

        return taskMapper.toResponse(task);
    }

    /** Мягкое удаление: физическое удаление засорило бы БД, ссылки учеников — сломались бы. */
    @Transactional
    public void delete(Long id, Long teacherId) {
        // Проверку «не удалено» делает findOwnedActiveTask: повторный DELETE вернёт 404, а не 500.
        Task task = findOwnedActiveTask(id, teacherId);
        task.setDeletedAt(Instant.now());
    }

    private Task findActiveWithRelations(Long id) {
        Task task = taskRepository.findWithRelationsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Задание не найдено: id=" + id));
        if (task.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Задание удалено: id=" + id);
        }
        return task;
    }

    /**
     * Задания в банке общие (читать может каждый), но редактировать и удалять может только автор.
     * Чужое задание возвращает 403 Forbidden (AccessDeniedException → обработчик в GlobalExceptionHandler).
     */
    private Task findOwnedActiveTask(Long id, Long teacherId) {
        Task task = findActiveWithRelations(id);
        if (!task.getCreatedBy().getId().equals(teacherId)) {
            throw new AccessDeniedException("Редактировать и удалять задание может только его автор");
        }
        return task;
    }

    /**
     * Валидация JSONB-контента до записи в БД (InvalidRequestException → 400 Bad Request).
     * Форматы описаны в README; без этой проверки битый JSON попадал бы в tasks.context / task_items.content.
     */
    private void validateContent(String contextJson, List<TaskItemRequest> items) {
        contentValidator.validateContext(contextJson, items);
        items.forEach(contentValidator::validateItem);
    }

    private List<TaskItem> mapItems(List<TaskItemRequest> requests) {
        List<TaskItem> items = new ArrayList<>();
        int pos = 0;
        for (TaskItemRequest r : requests) {
            TaskItem item = taskMapper.toEntity(r);
            item.setPosition(pos++);
            items.add(item);
        }
        return items;
    }

    /** Soft-deleted темы и типы нельзя привязывать к заданиям. */
    private Set<Topic> resolveTopics(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new LinkedHashSet<>(); // темы опциональны
        }
        List<Topic> found = topicRepository.findAllByIdAndDeletedAtIsNull(new ArrayList<>(ids));
        if (found.size() != ids.size()) {
            throw new InvalidRequestException("Некоторые темы не найдены или удалены");
        }
        return new LinkedHashSet<>(found);
    }

    private Set<TaskType> resolveTaskTypes(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new InvalidRequestException("Задание должно иметь хотя бы один тип");
        }
        List<TaskType> found = taskTypeRepository.findAllByIdAndDeletedAtIsNull(new ArrayList<>(ids));
        if (found.size() != ids.size()) {
            throw new InvalidRequestException("Некоторые типы заданий не найдены или удалены");
        }
        if (found.stream().anyMatch(t -> !Boolean.TRUE.equals(t.getIsActive()))) {
            throw new InvalidRequestException("Нельзя использовать отключенные типы заданий");
        }
        return new LinkedHashSet<>(found);
    }
}
