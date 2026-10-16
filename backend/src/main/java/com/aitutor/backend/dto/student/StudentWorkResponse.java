package com.aitutor.backend.dto.student;

import com.aitutor.backend.enums.WorkStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

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
    private Instant startedAt;
    private Instant completedAt;
}
