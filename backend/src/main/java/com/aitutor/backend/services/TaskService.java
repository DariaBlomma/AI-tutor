package com.aitutor.backend.services.task;

import com.aitutor.backend.dto.task.TaskCreateRequest;
import com.aitutor.backend.dto.task.TaskResponse;
import com.aitutor.backend.entities.Task;
import com.aitutor.backend.entities.TaskType;
import com.aitutor.backend.entities.Topic;
import com.aitutor.backend.entities.User;
import com.aitutor.backend.exceptions.InvalidRequestException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.mappers.TaskMapper;
import com.aitutor.backend.repositories.TaskRepository;
import com.aitutor.backend.repositories.TaskTypeRepository;
import com.aitutor.backend.repositories.TopicRepository;
import com.aitutor.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional(readOnly = true)
    public List<TaskResponse> getAll() {
        return taskRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(Long id) {
        Task task = taskRepository.findWithRelationsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Задание не найдено: id=" + id));
        return taskMapper.toResponse(task);
    }

    @Transactional
    public TaskResponse create(TaskCreateRequest request, Long teacherId) {
        User teacher = userRepository.findActiveById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Учитель не найден: id=" + teacherId));

        Set<Topic> topics = resolveTopics(request.getTopicIds());
        Set<TaskType> taskTypes = resolveTaskTypes(request.getTaskTypeIds());

        Task task = Task.builder()
                .name(request.getName())
                .createdBy(teacher)
                .topics(topics)
                .taskTypes(taskTypes)
                .build();

        // Бизнес-правило: больше одного типа => задание "смешанное"
        task.setIsMixed(taskTypes.size() > 1);

        return taskMapper.toResponse(taskRepository.save(task));
    }

    private Set<Topic> resolveTopics(Set<Long> ids) {
        List<Topic> found = topicRepository.findAllById(ids);
        if (found.size() != ids.size()) {
            throw new InvalidRequestException("Некоторые темы не найдены");
        }
        return new LinkedHashSet<>(found);
    }

    private Set<TaskType> resolveTaskTypes(Set<Long> ids) {
        List<TaskType> found = taskTypeRepository.findAllById(ids);
        if (found.size() != ids.size()) {
            throw new InvalidRequestException("Некоторые типы заданий не найдены");
        }
        if (found.stream().anyMatch(t -> !Boolean.TRUE.equals(t.getIsActive()))) {
            throw new InvalidRequestException("Нельзя использовать отключенные типы заданий");
        }
        return new LinkedHashSet<>(found);
    }
}