package com.aitutor.backend.dto.student;

import com.aitutor.backend.enums.ItemProgressStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Результат приёма одного ответа (ответ submit-эндпоинта).
 * ВАЖНО: правильных ответов здесь нет никогда — даже когда подсказки исчерпаны
 * и пункт закрывается как SOLVED. Эталон остаётся на бэкенде (см. StudentTaskItemDto).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSubmitAnswerResponse {

    private Long taskItemId;
    /** Верно ли сданное значение (вердикт бэкенда). */
    private boolean correct;
    /** Новый статус пункта после проверки. */
    private ItemProgressStatus status;
    /** Всего попыток по пункту (включая текущую). */
    private Integer attemptsCount;
    /** Учтённых подсказок по пункту. */
    private Integer hintsGiven;
    /** Решена ли работа целиком (все пункты SOLVED) — сигнал фронту показать «Завершить». */
    private boolean allItemsSolved;
}
