package com.aitutor.backend.dto.student;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Назначение конкретных заданий (не курсов!) списку учеников.
 * Курс — только удобная папка для визуальной фильтрации банка на фронте учителя;
 * фронт сам разворачивает состав курса в список taskIds перед отправкой.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignTasksRequest {

    @NotEmpty(message = "Список id учеников обязателен")
    private List<Long> studentIds;

    @NotEmpty(message = "Список id заданий обязателен")
    private List<Long> taskIds;

    /** Опциональный дедлайн (ISO-8601 UTC); по истечении назначение станет EXPIRED. */
    private Instant deadline;

    /** Страховка от «назначить в прошлое» при задержке часов клиента (проверяется в сервисе). */
    public boolean isDeadlineInPast() {
        return deadline != null && deadline.isBefore(Instant.now());
    }
}
