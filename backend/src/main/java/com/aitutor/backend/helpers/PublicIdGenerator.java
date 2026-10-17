package com.aitutor.backend.helpers;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Генератор публичных идентификаторов для отображения в UI (TSK-1, TSK-2, ...).
 * <p>
 * Числа берутся из отдельной SQL-последовательности {@code task_public_id_seq}
 * (см. миграцию 005): nextval атомарен на стороне PostgreSQL, поэтому значения
 * уникальны даже при параллельной регистрации без каких-либо блокировок со стороны
 * приложения. Последовательность стартует с 1 и растёт минимально possible шагами —
 * публичные id остаются максимально короткими цифрами.
 * <p>
 * Значение берётся ДО INSERT и включается сразу в INSERT сущности — UPDATE после
 * вставки больше не нужен (хрупкая схема saveAndFlush -> точечный UPDATE убрана).
 */
@Component
@RequiredArgsConstructor
public class PublicIdGenerator {

    private final JdbcTemplate jdbcTemplate;

    public String nextTaskId() {
        Long seq = jdbcTemplate.queryForObject("SELECT nextval('task_public_id_seq')", Long.class);
        if (seq == null) {
            throw new IllegalStateException("Sequence task_public_id_seq returned null");
        }
        return "TSK-" + seq;
    }
}
