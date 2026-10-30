package com.aitutor.backend.dto.task;

import com.aitutor.backend.dto.topic.TopicResponse;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
import com.aitutor.backend.enums.CefrLevel;
import com.aitutor.backend.enums.ExamType;
import com.aitutor.backend.enums.ItemType;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Лёгкое представление задания для общего списка (банк заданий).
 * Контент (items) не отдаётся — только метаинформация и превью.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskSummaryResponse {
    private Long id;
    private String publicId;
    private String name;
    private String previewText;
    private Boolean isMixed;
    /** Уровни CEFR задания (чипы/фильтр в банке; у старых данных может быть пусто). */
    private Set<CefrLevel> levels;
    /** Тип экзамена: OGE / EGE (чипы/фильтр в банке). */
    private ExamType examType;
    private Set<TopicResponse> topics;
    private Set<TaskTypeResponse> taskTypes;
    private Integer itemCount;
    private Instant createdAt;
    /** Уникальные механики пунктов (для чипов в карточке банка заданий). */
    private List<ItemType> itemTypes;
    /** Автор задания — фронт скрывает действия для чужих заданий. */
    private Long createdById;
}
