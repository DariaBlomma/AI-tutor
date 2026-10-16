package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.task.TaskCreateRequest;
import com.aitutor.backend.dto.task.TaskResponse;
import com.aitutor.backend.dto.task.TaskSummaryResponse;
import com.aitutor.backend.dto.task.TaskUpdateRequest;
import com.aitutor.backend.security.CustomUserDetails;
import com.aitutor.backend.services.task.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /** Лёгкий список банка заданий: мета + превью, без контента. */
    @GetMapping
    public List<TaskSummaryResponse> getAll(
            @RequestParam(required = false) Long taskTypeId,
            // Строгий поиск по умолчанию: смешанные задания не попадают в выдачу
            @RequestParam(defaultValue = "false") boolean includeMixed,
            @RequestParam(required = false) String search) {
        return taskService.getAll(taskTypeId, includeMixed, search);
    }

    /** Детальная карточка: полный контент (topics, taskTypes, items). */
    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable Long id) {
        return taskService.getById(id);
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
