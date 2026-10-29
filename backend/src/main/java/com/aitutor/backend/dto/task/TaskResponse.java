package com.aitutor.backend.dto.task;

import com.aitutor.backend.dto.topic.TopicResponse;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String publicId;
    private String name;
    private String previewText;
    private String instruction;
    private String context;
    private Boolean isMixed;
    private Set<TopicResponse> topics;
    private Set<TaskTypeResponse> taskTypes;
    private List<TaskItemResponse> items;
    private Instant createdAt;
}
