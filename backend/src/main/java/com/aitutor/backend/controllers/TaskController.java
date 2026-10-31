package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.task.TaskCreateRequest;
import com.aitutor.backend.dto.task.TaskResponse;
import com.aitutor.backend.dto.task.TaskSummaryResponse;
import com.aitutor.backend.dto.task.TaskUpdateRequest;
import com.aitutor.backend.dto.task.TaskUsageResponse;
import com.aitutor.backend.security.CustomUserDetails;
import com.aitutor.backend.services.task.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Лёгкий список банка заданий: мета + превью, без контента.
     * Серверная пагинация: page/size; ответ — Spring Page (content/totalElements/totalPages/...).
     */
    @GetMapping
    public Page<TaskSummaryResponse> getAll(
            @RequestParam(required = false) Long taskTypeId,
            // Строгий поиск по умолчанию: смешанные задания не попадают в выдачу
            @RequestParam(defaultValue = "false") boolean includeMixed,
            @RequestParam(required = false) String search,
            // Механика пунктов (WORD_FORMATION / GAP_FILL / TFNS / MATCHING) — nullable
            @RequestParam(required = false) com.aitutor.backend.enums.ItemType itemType,
            // Уровень CEFR (A1..C1) — nullable
            @RequestParam(required = false) com.aitutor.backend.enums.CefrLevel level,
            // Тип экзамена (OGE / EGE) — nullable
            @RequestParam(required = false) com.aitutor.backend.enums.ExamType examType,
            // Фильтр по курсам (мультиселект банка заданий): задания, входящие хотя бы в один выбранный курс.
            @RequestParam(required = false) java.util.List<Long> courseIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return taskService.getAllPaged(taskTypeId, includeMixed, search, itemType, level, examType, courseIds, page, size);
    }

    /** Детальная карточка: полный контент (topics, taskTypes, items). */
    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable Long id) {
        return taskService.getById(id);
    }

    /** Детальная карточка по публичному id (T-000123) — ссылка в банке заданий ведёт на страницу просмотра. */
    @GetMapping("/by-public-id/{publicId}")
    public TaskResponse getByPublicId(@PathVariable String publicId) {
        return taskService.getByPublicId(publicId);
    }

    /**
     * Использование задания учениками (назначено/решено) — страница редактирования блокирует
     * по нему содержательные поля; бэк дополнительно проверяет это же при PUT.
     */
    @GetMapping("/by-public-id/{publicId}/usage")
    public TaskUsageResponse getUsageByPublicId(@PathVariable String publicId) {
        return taskService.getUsageByPublicId(publicId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@Valid @RequestBody TaskCreateRequest request,
                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        return taskService.create(request, userDetails.getId());
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id,
                               @Valid @RequestBody TaskUpdateRequest request,
                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        return taskService.update(id, request, userDetails.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal CustomUserDetails userDetails) {
        taskService.delete(id, userDetails.getId());
    }
}
