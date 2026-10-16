package com.aitutor.backend.dto.report;

import com.aitutor.backend.enums.WorkStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Уровень 2: превью одной работы ученика в ленте карточки ученика.
 * Для COMPLETED заполняются errorsCount и durationSeconds;
 * для остальных статусов эти поля null (данных о выполнении ещё нет).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentWorkReportItemDto {

    private Long workId;
    private Long taskId;
    private String taskPublicId;
    private String taskName;
    private List<String> topics;
    private List<String> taskTypes;
    private Boolean isMixed;

    private WorkStatus status;
    private Instant deadline;
    private Instant assignedAt;
    private Instant startedAt;
    private Instant completedAt;

    /** Длительность выполнения: completed_at − started_at (секунды), null если работа не завершена. */
    private Long durationSeconds;

    /** Количество ошибок по финальным ответам позиций (null пока работа не выполнена). */
    private Integer errorsCount;
}
