package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.report.StudentReportSummaryDto;
import com.aitutor.backend.dto.report.StudentWorkReportItemDto;
import com.aitutor.backend.dto.report.WorkReportDetailDto;
import com.aitutor.backend.enums.WorkStatus;
import com.aitutor.backend.security.CustomUserDetails;
import com.aitutor.backend.services.report.TeacherReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * Отчёты учителя: прогресс учеников без оценок (только факт выполнения и статистика).
 * Роль TEACHER уже обеспечена правилом /teacher/** в SecurityConfig.
 * Context-path /api добавлен сервером, здесь без /api.
 */
@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
public class TeacherReportController {

    private final TeacherReportService teacherReportService;

    /** Вкладка «Отчёты»: все свои ученики + счётчики только активных назначений. */
    @GetMapping("/reports")
    public List<StudentReportSummaryDto> getReportsOverview(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return teacherReportService.getReportsOverview(userDetails.getId());
    }

    /** Карточка ученика: все его работы со всеми статусами; фильтр по статусу и периоду завершения. */
    @GetMapping("/students/{studentId}/work/report")
    public List<StudentWorkReportItemDto> getStudentWorkFeed(
            @PathVariable Long studentId,
            @RequestParam(required = false) WorkStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return teacherReportService.getStudentWorkFeed(userDetails.getId(), studentId, status, from, to);
    }

    /** Детали выполненной работы: текст задания с эталонами + ответы ученика; 409 на невыполненные. */
    @GetMapping("/students/{studentId}/work/{workId}/report")
    public WorkReportDetailDto getWorkDetails(@PathVariable Long studentId,
                                              @PathVariable Long workId,
                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        return teacherReportService.getWorkDetails(userDetails.getId(), studentId, workId);
    }
}
