package com.aitutor.backend.services;

import com.aitutor.backend.dto.tasktype.TaskTypeRequest;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
import com.aitutor.backend.entities.TaskType;
import com.aitutor.backend.exceptions.ConflictException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.mappers.TaskTypeMapper;
import com.aitutor.backend.repositories.TaskTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskTypeService {

    private final TaskTypeRepository taskTypeRepository;
    private final TaskTypeMapper taskTypeMapper;

    /** onlyActive=false — админский/справочный список, включая отключенные */
    @Transactional(readOnly = true)
    public List<TaskTypeResponse> getAll(boolean onlyActive) {
        List<TaskType> list = onlyActive
                ? taskTypeRepository.findByIsActiveTrueOrderByNameAsc()
                : taskTypeRepository.findAll().stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .toList();
        return list.stream().map(taskTypeMapper::toResponse).toList();
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

    /** Мягкое удаление: деактивация вместо DELETE (задания и история не ломаются) */
    @Transactional
    public void deactivate(Long id) {
        TaskType type = getOrThrow(id);
        type.setIsActive(false);
    }

    private TaskType getOrThrow(Long id) {
        return taskTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Тип задания не найден: id=" + id));
    }
}