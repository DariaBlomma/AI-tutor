package com.aitutor.backend.dto.task;

import com.aitutor.backend.dto.topic.TopicResponse;
import com.aitutor.backend.enums.CefrLevel;
import com.aitutor.backend.enums.ExamType;
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
    /** Уровни CEFR задания (минимум один с миграции 021; у старых данных может быть пусто). */
    private Set<CefrLevel> levels;
    /** Тип экзамена: OGE / EGE (nullable = не указан). */
    private ExamType examType;
    private Set<TopicResponse> topics;
    private Set<TaskTypeResponse> taskTypes;
    private List<TaskItemResponse> items;
    private Instant createdAt;
}
