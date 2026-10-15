package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.tasktype.TaskTypeRequest;
import com.aitutor.backend.dto.tasktype.TaskTypeResponse;
import com.aitutor.backend.services.TaskTypeService;
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

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        taskTypeService.deactivate(id);
    }
}