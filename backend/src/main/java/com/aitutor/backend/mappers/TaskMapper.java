package com.aitutor.backend.mappers;

import com.aitutor.backend.dto.task.TaskItemRequest;
import com.aitutor.backend.dto.task.TaskItemResponse;
import com.aitutor.backend.dto.task.TaskResponse;
import com.aitutor.backend.entities.Task;
import com.aitutor.backend.entities.TaskItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring",
        uses = {com.aitutor.backend.mappers.TopicMapper.class,
                com.aitutor.backend.mappers.TaskTypeMapper.class})
public interface TaskMapper {

    TaskResponse toResponse(Task task);

    TaskItemResponse toResponse(TaskItem item);

    TaskItem toEntity(TaskItemRequest request);
}