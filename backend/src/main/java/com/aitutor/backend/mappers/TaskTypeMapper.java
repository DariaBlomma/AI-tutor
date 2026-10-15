package com.aitutor.backend.mappers;

import com.aitutor.backend.dto.tasktype.TaskTypeRequest;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
import com.aitutor.backend.entities.TaskType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TaskTypeMapper {
    TaskType toEntity(TaskTypeRequest request);
    TaskTypeResponse toResponse(TaskType taskType);
}