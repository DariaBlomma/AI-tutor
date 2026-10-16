package com.aitutor.backend.mappers;

import com.aitutor.backend.dto.task.TaskItemRequest;
import com.aitutor.backend.dto.task.TaskItemResponse;
import com.aitutor.backend.dto.task.TaskResponse;
import com.aitutor.backend.dto.task.TaskSummaryResponse;
import com.aitutor.backend.dto.topic.TopicResponse;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
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

    default TaskSummaryResponse toSummary(Task task) {
        if (task == null) {
            return null;
        }
        return TaskSummaryResponse.builder()
                .id(task.getId())
                .publicId(task.getPublicId())
                .name(task.getName())
                .previewText(task.getPreviewText())
                .isMixed(task.getIsMixed())
                .topics(mapTopics(task.getTopics()))
                .taskTypes(mapTaskTypes(task.getTaskTypes()))
                .itemCount(task.getItems() == null ? 0 : task.getItems().size())
                .createdAt(task.getCreatedAt())
                .build();
    }

    private static java.util.Set<TopicResponse> mapTopics(java.util.Set<com.aitutor.backend.entities.Topic> topics) {
        return topics.stream()
                .map(t -> TopicResponse.builder().id(t.getId()).name(t.getName()).build())
                .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private static java.util.Set<TaskTypeResponse> mapTaskTypes(java.util.Set<com.aitutor.backend.entities.TaskType> types) {
        return types.stream()
                .map(tt -> TaskTypeResponse.builder()
                        .id(tt.getId())
                        .name(tt.getName())
                        .description(tt.getDescription())
                        .isActive(tt.getIsActive())
                        .build())
                .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
    }
}
