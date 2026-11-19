package com.aitutor.backend.dto.student;

import com.aitutor.backend.dto.topic.TopicResponse;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
import com.aitutor.backend.enums.WorkStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Карточка назначения задания ученику — для «Моих заданий» (ученик)
 * и списка назначений учителя. Оценок нет: только статус и дедлайн.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentWorkResponse {

    private Long id;
    private Long taskId;
    private String taskPublicId;
    private String taskName;
    private WorkStatus status;
    private Instant deadline;
    private Instant assignedAt;
    private Instant createdAt;
    private Instant startedAt;
    private Instant completedAt;

    /** Уровни CEFR задания (чипы в карточке). */
    private Set<String> levels;
    /** Типы заданий (чипы). */
    private List<TaskTypeResponse> taskTypes;
    /** Темы (чипы). */
    private List<TopicResponse> topics;
    /** Уникальные механики пунктов (чипы). */
    private List<String> itemTypes;
    /** Флаг смешанного задания. */
    private Boolean isMixed;
}
