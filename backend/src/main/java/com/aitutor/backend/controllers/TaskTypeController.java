package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.tasktype.TaskTypeRequest;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
import com.aitutor.backend.services.task.TaskTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/task-types")
@RequiredArgsConstructor
public class TaskTypeController {

    private final TaskTypeService taskTypeService;

    @GetMapping
    public List<TaskTypeResponse> getAll(@RequestParam(defaultValue = "false") boolean activeOnly) {
        return taskTypeService.getAll(activeOnly);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskTypeResponse create(@Valid @RequestBody TaskTypeRequest request) {
        return taskTypeService.create(request);
    }

    @PutMapping("/{id}")
    public TaskTypeResponse update(@PathVariable Long id, @Valid @RequestBody TaskTypeRequest request) {
        return taskTypeService.update(id, request);
    }

    /** Деактивация: тип перестаёт предлагаться при создании новых заданий */
    @PatchMapping("/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        taskTypeService.deactivate(id);
    }

    /** Мягкое удаление: скрыть тип из справочника целиком */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        taskTypeService.delete(id);
    }
}