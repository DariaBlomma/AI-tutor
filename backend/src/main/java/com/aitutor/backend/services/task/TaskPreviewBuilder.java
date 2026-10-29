package com.aitutor.backend.services.task;

import com.aitutor.backend.entities.TaskItem;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Строит превью задания для отображения в общем списке банка заданий.
 * Зависит от типа пунктов:
 * - пропуски (WORD_FORMATION, GAP_FILL) — первые несколько prompt'ов с "___";
 *   если в content есть options (список-подсказка), они дописываются через " / " после prompt;
 * - форматы с материалом/вариантами (TFNS, MATCHING) — первые несколько утверждений/заголовков.
 */
@Component
public class TaskPreviewBuilder {

    private static final int MAX_LINES = 3;
    private static final int MAX_LINE_LENGTH = 120;
    // Разделитель подсказок-опций при отображении (решение по UX: варианты через слэш).
    private static final String OPTIONS_SEPARATOR = " / ";

    // Единый ObjectMapper внедряется из контекста (поток-безопасен), а не создаётся на каждый пункт.
    private final ObjectMapper objectMapper;

    public TaskPreviewBuilder(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

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
            // GAP_FILL: к prompt дописываем необязательные подсказки-опции через слэш.
            case GAP_FILL -> truncate(withOptions(item.getPrompt(), item.getContent()));
            case WORD_FORMATION -> truncate(item.getPrompt());
            // TFNS: показываем утверждение из prompt.
            case TFNS -> truncate(item.getPrompt());
            // MATCHING: промпта может не быть — показываем левую часть пары из content.
            case MATCHING -> matchingLine(item);
        };
    }

    // "prompt (opt1 / opt2)" — options берутся из content JSONB; если их нет/парс упал — только prompt.
    private String withOptions(String prompt, String contentJson) {
        String base = prompt == null ? "" : prompt.strip();
        if (contentJson == null || contentJson.isBlank()) {
            return base;
        }
        try {
            JsonNode options = objectMapper.readTree(contentJson).path("options");
            if (!options.isArray() || options.isEmpty()) {
                return base;
            }
            StringBuilder joined = new StringBuilder();
            options.forEach(o -> {
                if (o.isTextual() && !o.asText().isBlank()) {
                    if (!joined.isEmpty()) {
                        joined.append(OPTIONS_SEPARATOR);
                    }
                    joined.append(o.asText().strip());
                }
            });
            return joined.isEmpty() ? base : base + " (" + joined + ")";
        } catch (Exception e) {
            return base;
        }
    }

    private String matchingLine(TaskItem item) {
        if (item.getPrompt() != null && !item.getPrompt().isBlank()) {
            return truncate(item.getPrompt());
        }
        try {
            JsonNode content = objectMapper.readTree(item.getContent());
            String left = content.path("left_label").asText(null);
            return left != null ? truncate(left) : null;
        } catch (Exception e) {
            return null;
        }
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
