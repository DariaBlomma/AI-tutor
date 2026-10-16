package com.aitutor.backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Уровень 1 вкладки «Отчёты»: строка сводки по одному ученику.
 * Считаем ТОЛЬКО активные назначения (ASSIGNED + IN_PROGRESS) — по решению заказчика
 * суммарная история («всего когда-либо выполнено») здесь не нужна.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentReportSummaryDto {

    private Long studentId;
    private String studentName;
    private String email;

    /** Активные назначения всего = ASSIGNED + IN_PROGRESS. */
    private int assignedCount;
    /** Из них уже начато учеником (IN_PROGRESS). */
    private int inProgressCount;
}
