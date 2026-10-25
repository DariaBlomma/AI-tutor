package com.aitutor.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Краткий прогресс ученика по АКТУАЛЬНЫМ назначениям (статусы ASSIGNED / IN_PROGRESS):
 * «сколько заданий пройдено» и «сколько пунктов решено» — например, 2 из 5 работ,
 * 7 из 20 пунктов. Завершённые (COMPLETED), просроченные (EXPIRED) и отменённые
 * (CANCELLED) работы в знаменатель не входят — только то, что «назначено по времени сейчас».
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgressOverviewResponse {

    /** Активных назначений всего (ASSIGNED + IN_PROGRESS). */
    private Integer totalActiveWorks;
    /** Из них доведено до конца: все пункты SOLVED (ученик ещё не нажал complete). */
    private Integer worksFullySolved;
    /** Пунктов во всех активных работах суммарно. */
    private Integer totalItems;
    /** Из них решено (SOLVED). */
    private Integer solvedItems;
    /** Подсказок использовано суммарно по активным работам. */
    private Integer hintsUsed;
}
