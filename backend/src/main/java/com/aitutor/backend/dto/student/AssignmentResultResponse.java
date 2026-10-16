package com.aitutor.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Итог пакетного назначения: сколько создано, сколько пропущено как дубли.
 * Повтор того же задания тому же ученику молча пропускается (skipped), если
 * активное назначение ещё есть; завершённые/истёкшие/отменённые не считаются дублем.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResultResponse {

    private int createdCount;
    private int skippedDuplicateCount;
}
