package com.aitutor.backend.dto.course;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Bulk-добавление заданий в курсы: POST /courses/bulk-add.
 * Дубликаты (задание уже в курсе) молча игнорируются.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseBulkAddRequest {

    @NotEmpty(message = "Список taskIds обязателен")
    private Set<Long> taskIds;

    @NotEmpty(message = "Список courseIds обязателен")
    private Set<Long> courseIds;
}
