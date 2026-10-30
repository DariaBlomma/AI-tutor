package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.course.CourseByTaskResponse;
import com.aitutor.backend.dto.course.CourseRequest;
import com.aitutor.backend.dto.course.CourseResponse;
import com.aitutor.backend.dto.course.CourseSummaryResponse;
import com.aitutor.backend.dto.course.CourseTaskAddRequest;
import com.aitutor.backend.dto.course.CourseTasksReorderRequest;
import com.aitutor.backend.security.CustomUserDetails;
import com.aitutor.backend.services.course.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Курсы учителя («плейлисты» из заданий банка). Все эндпоинты — только для TEACHER
 * (настроено в SecurityConfig по префиксу /courses).
 */
@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    /** Список моих курсов: мета + количество заданий. */
    @GetMapping
    public List<CourseSummaryResponse> getAll(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.getAll(userDetails.getId());
    }

    /**
     * Мои курсы с флагом «задание уже в курсе» — для попапа выбора курса
     * на странице просмотра задания (Добавить/Удалить из курса).
     */
    @GetMapping(params = "taskId")
    public List<CourseByTaskResponse> getAllWithTaskFlag(@RequestParam Long taskId,
                                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.getAllWithTaskFlag(taskId, userDetails.getId());
    }

    /** Детали курса: состав заданий в порядке position. */
    @GetMapping("/{id}")
    public CourseResponse getById(@PathVariable Long id,
                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.getById(id, userDetails.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseResponse create(@Valid @RequestBody CourseRequest request,
                                 @AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.create(request, userDetails.getId());
    }

    /** Переименование курса. */
    @PutMapping("/{id}")
    public CourseResponse update(@PathVariable Long id,
                                 @Valid @RequestBody CourseRequest request,
                                 @AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.update(id, request, userDetails.getId());
    }

    /** Soft-delete курса (состав заданий в банке не трогается). */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal CustomUserDetails userDetails) {
        courseService.delete(id, userDetails.getId());
    }

    /** Добавить задание из банка в курс (position=null — в конец). */
    @PostMapping("/{id}/tasks")
    public CourseResponse addTask(@PathVariable Long id,
                                  @Valid @RequestBody CourseTaskAddRequest request,
                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.addTask(id, request, userDetails.getId());
    }

    /** Убрать задание из курса (задание остаётся в банке). */
    @DeleteMapping("/{id}/tasks/{taskId}")
    public CourseResponse removeTask(@PathVariable Long id,
                                     @PathVariable Long taskId,
                                     @AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.removeTask(id, taskId, userDetails.getId());
    }

    /**
     * Применить новый порядок после drag-and-drop на фронте:
     * просто список id заданий, позиция = индекс в списке.
     */
    @PutMapping("/{id}/tasks/order")
    public CourseResponse reorder(@PathVariable Long id,
                                  @Valid @RequestBody CourseTasksReorderRequest request,
                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        return courseService.reorder(id, request.getTaskIds(), userDetails.getId());
    }
}
