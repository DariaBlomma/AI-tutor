package com.aitutor.backend.services.task;

import com.aitutor.backend.dto.tasktype.TaskTypeRequest;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
import com.aitutor.backend.entities.TaskType;
import com.aitutor.backend.exceptions.ConflictException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.mappers.TaskTypeMapper;
import com.aitutor.backend.repositories.task.TaskRepository;
import com.aitutor.backend.repositories.task.TaskTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskTypeService {

    private final TaskTypeRepository taskTypeRepository;
    private final TaskRepository taskRepository;
    private final TaskTypeMapper taskTypeMapper;

    /** onlyActive=true — список для создания заданий; false — справочный, включая деактивированные */
    @Transactional(readOnly = true)
    public List<TaskTypeResponse> getAll(boolean onlyActive) {
        List<TaskType> list = onlyActive
                ? taskTypeRepository.findByIsActiveTrueAndDeletedAtIsNullOrderByNameAsc()
                : taskTypeRepository.findByDeletedAtIsNullOrderByNameAsc();
        return list.stream()
                .sorted(Comparator.comparing(TaskType::getName, String.CASE_INSENSITIVE_ORDER))
                .map(taskTypeMapper::toResponse)
                .toList();
    }

    @Transactional
    public TaskTypeResponse create(TaskTypeRequest request) {
        if (taskTypeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Тип задания с таким названием уже существует");
        }
        TaskType entity = taskTypeMapper.toEntity(request);
        entity.setIsActive(true);
        return taskTypeMapper.toResponse(taskTypeRepository.save(entity));
    }

    @Transactional
    public TaskTypeResponse update(Long id, TaskTypeRequest request) {
        TaskType type = getOrThrow(id);
        if (taskTypeRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new ConflictException("Тип задания с таким названием уже существует");
        }
        type.setName(request.getName());
        type.setDescription(request.getDescription());
        return taskTypeMapper.toResponse(type);
    }

    /**
     * Удаление справочника — двухшаговое:
     * 1) deactivate (is_active=false) — тип перестаёт предлагаться при создании новых заданий;
     * 2) delete (soft-delete deleted_at) — скрыть тип из справочника целиком.
     * При deactivate пересчитываем is_mixed у всех заданий: смешанным считается задание
     * с 2+ активными типами, иначе деактивация типа навсегда ломает строгий поиск по заданию.
     */
    @Transactional
    public void deactivate(Long id) {
        TaskType type = getOrThrow(id);
        type.setIsActive(false);
        taskRepository.recalculateMixedFlags();
    }

    @Transactional
    public void delete(Long id) {
        TaskType type = getOrThrow(id);
        type.setDeletedAt(Instant.now());
    }

    private TaskType getOrThrow(Long id) {
        return taskTypeRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Тип задания не найден: id=" + id));
    }
}
