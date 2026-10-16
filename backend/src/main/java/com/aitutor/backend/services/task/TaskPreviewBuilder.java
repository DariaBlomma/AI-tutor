package com.aitutor.backend.services.task;

import com.aitutor.backend.entities.TaskItem;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Строит превью задания для отображения в общем списке банка заданий.
 * Зависит от типа пунктов:
 * - пропуски (WORD_FORMATION, GAP_FILL, OPEN_GAP) — первые несколько prompt'ов с "___";
 * - форматы с материалом/вариантами (TFNS, MATCHING) — первые несколько утверждений/заголовков.
 */
@Component
public class TaskPreviewBuilder {

    private static final int MAX_LINES = 3;
    private static final int MAX_LINE_LENGTH = 120;

    public String build(List<TaskItem> items) {
        if (items == null || items.isEmpty()) {
            return null;
        }
        return items.stream()
                .map(this::lineFor)
                .filter(line -> line != null && !line.isBlank())
                .limit(MAX_LINES)
                .reduce((a, b) -> a + "\n" + b)
                .orElse(null);
    }

    private String lineFor(TaskItem item) {
        if (item.getItemType() == null) {
            return truncate(item.getPrompt());
        }
        return switch (item.getItemType()) {
            case WORD_FORMATION, GAP_FILL, OPEN_GAP -> truncate(item.getPrompt());
            // Для TFNS/MATCHING и прочих форматных заданий показываем сам пункт,
            // при отсутствии prompt'а — content (список утверждений/заголовков).
            case TFNS, MATCHING, TRANSLATION, FREE_TEXT ->
                    item.getPrompt() != null && !item.getPrompt().isBlank()
                            ? truncate(item.getPrompt())
                            : truncate(item.getContent());
        };
    }

    private String truncate(String text) {
        if (text == null) {
            return null;
        }
        String trimmed = text.strip();
        if (trimmed.length() <= MAX_LINE_LENGTH) {
            return trimmed;
        }
        return trimmed.substring(0, MAX_LINE_LENGTH) + "…";
    }
}
