package com.aitutor.backend.dto.student;

import com.aitutor.backend.enums.WorkStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Полный контент назначенной работы для экрана выполнения: задание целиком
 * (без правильных ответов) + текущий прогресс по каждому пункту.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentWorkDetailResponse {

    private Long workId;
    private Long taskId;
    private String taskPublicId;
    private String taskName;
    private WorkStatus status;
    private Instant deadline;
    private Instant startedAt;
    private Instant completedAt;
    private List<StudentTaskItemDto> items;
    private List<StudentItemProgressDto> progress;
}
