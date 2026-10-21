package com.aitutor.backend.services.task;

import com.aitutor.backend.exceptions.InvalidRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Валидирует JSONB-контент (task_items.content и tasks.context) по типу пункта задания.
 * Форматы: WORD_FORMATION, GAP_FILL, TFNS, MATCHING.
 * Полное описание формата — в README (backend/README.md, раздел «Формат контента заданий»).
 */
@Component
@RequiredArgsConstructor
public class TaskContentValidator {

    private static final String GAP_MARK = "___";
    private static final int MAX_ANSWER_LENGTH = 200; // колонка correct_answer VARCHAR(200)

    private final ObjectMapper objectMapper;

    /** Проверяет tasks.context (общий материал задания) с учётом типов пунктов. */
    public void validateContext(String contextJson, java.util.List<com.aitutor.backend.dto.task.TaskItemRequest> items) {
        boolean needsMaterial = items != null && items.stream()
                .anyMatch(i -> i.getItemType() == com.aitutor.backend.enums.ItemType.TFNS
                        || i.getItemType() == com.aitutor.backend.enums.ItemType.MATCHING);
        if (!needsMaterial) {
            return; // контекст нужен только для форматов с материалом
        }
        if (contextJson == null || contextJson.isBlank()) {
            throw new InvalidRequestException("Для TFNS/MATCHING нужен tasks.context с материалом (текст/аудио)");
        }
        JsonNode ctx = parse(contextJson, "tasks.context");
        requireObject(ctx, "tasks.context");

        String type = textOrNull(ctx, "type");
        if (type == null) {
            throw new InvalidRequestException("tasks.context.type обязателен: \"TEXT\" или \"AUDIO\"");
        }
        switch (type) {
            case "TEXT" -> requireNonEmptyString(ctx, "text", "tasks.context.text (для type=TEXT)");
            case "AUDIO" -> requireNonEmptyString(ctx, "url", "tasks.context.url (для type=AUDIO)");
            default -> throw new InvalidRequestException("tasks.context.type должен быть TEXT или AUDIO, получено: " + type);
        }
        // title — необязательная подпись материала
        optionalNonEmptyString(ctx, "title", "tasks.context.title");
    }

    /** Проверяет task_items.content и корректность prompt/correctAnswer под формат пункта. */
    public void validateItem(com.aitutor.backend.dto.task.TaskItemRequest item) {
        switch (item.getItemType()) {
            case WORD_FORMATION -> validateWordFormation(item);
            case GAP_FILL -> validateGapFill(item);
            case TFNS -> validateTfns(item);
            case MATCHING -> validateMatching(item);
        }
    }

    // ---- WORD_FORMATION -------------------------------------------------

    private void validateWordFormation(com.aitutor.backend.dto.task.TaskItemRequest item) {
        requireGapInPrompt(item);
        requireCorrectAnswer(item);
        JsonNode content = optionalObject(item.getContent(), "content");
        if (content != null) {
            checkKnownFields(content, "WORD_FORMATION", "base", "explanation");
            requireNonEmptyString(content, "base", "content.base (слово в скобках)");
            optionalNonEmptyString(content, "explanation", "content.explanation");
        }
    }

    // ---- GAP_FILL -------------------------------------------------------

    private void validateGapFill(com.aitutor.backend.dto.task.TaskItemRequest item) {
        requireGapInPrompt(item);
        requireCorrectAnswer(item);
        JsonNode content = optionalObject(item.getContent(), "content");
        if (content != null) {
            checkKnownFields(content, "GAP_FILL", "options", "explanation");
            if (content.has("options")) {
                JsonNode options = content.get("options");
                if (!options.isArray() || options.isEmpty()) {
                    throw new InvalidRequestException("content.options должен быть непустым массивом строк");
                }
                options.forEach(o -> requireTextNode(o, "элемент content.options"));
            }
            optionalNonEmptyString(content, "explanation", "content.explanation");
        }
    }

    // ---- TFNS -----------------------------------------------------------

    private void validateTfns(com.aitutor.backend.dto.task.TaskItemRequest item) {
        requireNonBlankPrompt(item);
        requireCorrectAnswer(item);
        String answer = item.getCorrectAnswer().strip().toUpperCase();
        if (!answer.equals("TRUE") && !answer.equals("FALSE") && !answer.equals("NOT STATED")) {
            throw new InvalidRequestException(
                    "TFNS: correctAnswer должен быть TRUE / FALSE / NOT STATED, получено: \"" + item.getCorrectAnswer() + "\"");
        }
        JsonNode content = optionalObject(item.getContent(), "content");
        if (content != null) {
            checkKnownFields(content, "TFNS", "explanation");
            optionalNonEmptyString(content, "explanation", "content.explanation");
        }
    }

    // ---- MATCHING (вариант А: одна пара = один пункт) -------------------

    private void validateMatching(com.aitutor.backend.dto.task.TaskItemRequest item) {
        JsonNode content = requireObjectContent(item.getContent(), "MATCHING");
        checkKnownFields(content, "MATCHING", "left_label", "right_label", "explanation");
        requireNonEmptyString(content, "left_label", "content.left_label (заголовок/фрагмент слева)");
        requireNonEmptyString(content, "right_label", "content.right_label (правильная часть справа)");
        optionalNonEmptyString(content, "explanation", "content.explanation");
        // correctAnswer для matching не используется (эталон — сама пара left/right).
        if (item.getCorrectAnswer() != null && !item.getCorrectAnswer().isBlank()) {
            throw new InvalidRequestException("MATCHING: correctAnswer не используется, эталон — пара в content");
        }
        // prompt — необязательная подсказка; если задан, должен быть непустой строкой
        if (item.getPrompt() != null && item.getPrompt().isBlank()) {
            throw new InvalidRequestException("MATCHING: prompt либо не задан, либо непустая строка");
        }
    }

    // ---- helpers --------------------------------------------------------

    private JsonNode parse(String json, String field) {
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            throw new InvalidRequestException(field + ": некорректный JSON");
        }
    }

    private JsonNode optionalObject(String json, String field) {
        if (json == null || json.isBlank()) {
            return null;
        }
        JsonNode node = parse(json, field);
        if (!node.isObject()) {
            throw new InvalidRequestException(field + " должен быть JSON-объектом");
        }
        return node;
    }

    private JsonNode requireObjectContent(String json, String format) {
        if (json == null || json.isBlank()) {
            throw new InvalidRequestException(format + ": content обязателен");
        }
        return optionalObject(json, "content");
    }

    private void requireObject(JsonNode node, String field) {
        if (!node.isObject()) {
            throw new InvalidRequestException(field + " должен быть JSON-объектом");
        }
    }

    private void requireNonEmptyString(JsonNode node, String key, String description) {
        JsonNode value = node.get(key);
        if (value == null || !value.isTextual() || value.asText().isBlank()) {
            throw new InvalidRequestException(description + " — обязательная непустая строка");
        }
    }

    private void optionalNonEmptyString(JsonNode node, String key, String description) {
        JsonNode value = node.get(key);
        if (value != null && (!value.isTextual() || value.asText().isBlank())) {
            throw new InvalidRequestException(description + " — если указан, то непустая строка");
        }
    }

    private void requireTextNode(JsonNode value, String description) {
        if (!value.isTextual()) {
            throw new InvalidRequestException(description + " должен быть строкой");
        }
    }

    private void checkKnownFields(JsonNode node, String format, String... allowed) {
        java.util.Set<String> allowedSet = java.util.Set.of(allowed);
        node.properties().forEach(entry -> {
            String name = entry.getKey();
            if (!allowedSet.contains(name)) {
                throw new InvalidRequestException(
                        format + ": неизвестное поле content \"" + name + "\". Допустимо: " + String.join(", ", allowed));
            }
        });
    }

    private void requireGapInPrompt(com.aitutor.backend.dto.task.TaskItemRequest item) {
        if (item.getPrompt() == null || !item.getPrompt().contains(GAP_MARK)) {
            throw new InvalidRequestException(
                    item.getItemType() + ": в prompt должен быть пропуск \"___\"");
        }
    }

    private void requireNonBlankPrompt(com.aitutor.backend.dto.task.TaskItemRequest item) {
        if (item.getPrompt() == null || item.getPrompt().isBlank()) {
            throw new InvalidRequestException(item.getItemType() + ": prompt (текст утверждения) обязателен");
        }
    }

    private void requireCorrectAnswer(com.aitutor.backend.dto.task.TaskItemRequest item) {
        if (item.getCorrectAnswer() == null || item.getCorrectAnswer().isBlank()) {
            throw new InvalidRequestException(item.getItemType() + ": correctAnswer обязателен");
        }
        if (item.getCorrectAnswer().length() > MAX_ANSWER_LENGTH) {
            throw new InvalidRequestException("correctAnswer длиннее " + MAX_ANSWER_LENGTH + " символов");
        }
    }

    private String textOrNull(JsonNode node, String key) {
        JsonNode value = node.get(key);
        return (value != null && value.isTextual()) ? value.asText() : null;
    }
}
