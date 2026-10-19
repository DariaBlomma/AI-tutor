package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.student.AssignTasksRequest;
import com.aitutor.backend.dto.student.AssignmentResultResponse;
import com.aitutor.backend.dto.student.StudentSubmitAnswerRequest;
import com.aitutor.backend.dto.student.StudentSubmitAnswerResponse;
import com.aitutor.backend.dto.student.StudentWorkCompleteResponse;
import com.aitutor.backend.dto.student.StudentWorkDetailResponse;
import com.aitutor.backend.dto.student.StudentWorkResponse;
import com.aitutor.backend.dto.student.StudentWorkSummaryResponse;
import com.aitutor.backend.security.CustomUserDetails;
import com.aitutor.backend.services.student.StudentExecutionService;
import com.aitutor.backend.services.student.StudentWorkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Назначения заданий ученикам (student_work). Маршруты разведены по ролям в SecurityConfig:
 * /teacher/assignments/** — только TEACHER, /student/work/** — только STUDENT.
 * Context-path /api уже добавлен сервером, здесь без /api.
 */
@RestController
@RequiredArgsConstructor
public class StudentWorkController {

    private final StudentWorkService studentWorkService;
    private final StudentExecutionService studentExecutionService;

    /**
     * Назначить конкретные задания списку учеников (опционально — с дедлайном).
     * Дубли активных назначений молча пропускаются: см. created/skipped в ответе.
     */
    @PostMapping("/teacher/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    public AssignmentResultResponse assign(@Valid @RequestBody AssignTasksRequest request,
                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        return studentWorkService.assign(userDetails.getId(), request);
    }

    /** Отмена назначения (статус CANCELLED, запись остаётся как история). */
    @PatchMapping("/teacher/assignments/{workId}/cancel")
    public StudentWorkResponse cancel(@PathVariable Long workId,
                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        return studentWorkService.cancel(userDetails.getId(), workId);
    }

    /** Назначения конкретного своего ученика (для карточки ученика у учителя). */
    @GetMapping("/teacher/students/{studentId}/work")
    public List<StudentWorkResponse> getStudentWork(@PathVariable Long studentId,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        return studentWorkService.getStudentWork(userDetails.getId(), studentId);
    }

    /**
     * «Мои задания» ученика: статусы ASSIGNED / IN_PROGRESS / COMPLETED / CANCELLED / EXPIRED.
     * Пагинация и сортировка (deadline | status | createdAt, direction asc|desc).
     * Без параметров — поведение как раньше: все работы, свежие сверху (createdAt desc).
     */
    @GetMapping("/student/work")
    public Page<StudentWorkResponse> getMyWork(@AuthenticationPrincipal CustomUserDetails userDetails,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "100") int size,
                                               @RequestParam(required = false) String sort,
                                               @RequestParam(required = false) String direction) {
        return studentWorkService.getMyWorkPage(userDetails.getId(), page, size, sort, direction);
    }

    /** Старт выполнения: ASSIGNED → IN_PROGRESS; возвращает полный контент работы без эталонов. */
    @PostMapping("/student/work/{workId}/start")
    public StudentWorkDetailResponse startWork(@PathVariable Long workId,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        return studentExecutionService.start(userDetails.getId(), workId);
    }

    /** Экран выполнения: весь контент задания (без correctAnswer) + прогресс по пунктам. */
    @GetMapping("/student/work/{workId}")
    public StudentWorkDetailResponse getWorkDetail(@PathVariable Long workId,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails) {
        return studentExecutionService.getDetail(userDetails.getId(), workId);
    }

    /**
     * Сдача ответа по одному пункту: фронт присылает только ответ ученика,
     * вердикт выносит бэкенд (AnswerChecker). Эталонный ответ в ответе не отдаётся никогда.
     */
    @PostMapping("/student/work/{workId}/items/{itemId}/submit")
    public StudentSubmitAnswerResponse submitItem(@PathVariable Long workId,
                                                  @PathVariable Long itemId,
                                                  @Valid @RequestBody StudentSubmitAnswerRequest request,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        return studentExecutionService.submit(userDetails.getId(), workId, itemId, request);
    }

    /** Завершение работы: COMPLETED + итоговая статистика. Только когда все пункты SOLVED (force нет). */
    @PostMapping("/student/work/{workId}/complete")
    public StudentWorkCompleteResponse completeWork(@PathVariable Long workId,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        return studentExecutionService.complete(userDetails.getId(), workId);
    }

    /** Экран «Результаты»: агрегаты выполненной работы + длительность решения. */
    @GetMapping("/student/work/{workId}/summary")
    public StudentWorkSummaryResponse getSummary(@PathVariable Long workId,
                                                 @AuthenticationPrincipal CustomUserDetails userDetails) {
        return studentExecutionService.getSummary(userDetails.getId(), workId);
    }
}
