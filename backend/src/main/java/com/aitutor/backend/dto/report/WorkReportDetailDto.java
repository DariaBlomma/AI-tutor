package com.aitutor.backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Уровень 3: детали одной ВЫПОЛНЕННОЙ работы (student_work со статусом COMPLETED).
 * Доступ только для завершённых — на ASSIGNED/IN_PROGRESS/EXPIRED/CANCELLED сервис
 * бросает ConflictException (409): смотреть прогресс можно только по выполненным.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkReportDetailDto {

    private Long workId;
    private Long studentId;
    private String studentName;

    private Long taskId;
    private String taskPublicId;
    private String taskName;
    private List<String> topics;
    private List<String> taskTypes;
    private Boolean isMixed;

    /** Контекст задания (материал для монологa/TFNS и т.п.) из банка заданий. */
    private String context;

    private Instant startedAt;
    private Instant completedAt;

    /** Длительность выполнения: completed_at − started_at (секунды). */
    private Long durationSeconds;

    /** Количество ошибок по финальным ответам позиций. */
    private int errorsCount;

    /** Позиции задания с ответами ученика и эталоном, по порядку position. */
    private List<WorkItemAnswerDto> items;

    /** Комментарий ИИ. Сейчас всегда null — поле готово под будущую AI-интеграцию, заглушек нет. */
    private String aiComment;

}
