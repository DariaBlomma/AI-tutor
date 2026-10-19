package com.aitutor.backend.services.student.checking;

import com.aitutor.backend.entities.TaskItem;
import org.springframework.stereotype.Component;

/**
 * Детерминированная проверка «точное совпадение»: trim + регистронезависимое сравнение
 * с эталоном. Совпадает с логикой отчётов учителя (TeacherReportService.countFinalErrors),
 * поэтому вердикт здесь и ошибки в отчёте гарантированно одинаковые.
 * Варианты ответа через дефис («A-B») хранятся в correct_answer единой строкой и
 * засчитываются как есть — один item = один ответ = одна пара.
 * Примечание: MATCHING пока сравнивает строку целиком; канонизация порядка пар — известный долг.
 */
@Component
public class ExactMatchChecker implements AnswerChecker {

    @Override
    public boolean supports(TaskItem item) {
        // Все текущие форматы имеют текстовый эталон и проверяются детерминированно.
        return true;
    }

    @Override
    public CheckResult check(TaskItem item, String studentAnswer) {
        String correct = item.getCorrectAnswer();
        String answer = studentAnswer == null ? "" : studentAnswer.trim();
        boolean isCorrect = correct != null && !correct.isBlank()
                && correct.trim().equalsIgnoreCase(answer);
        return new CheckResult(isCorrect, answer);
    }
}
