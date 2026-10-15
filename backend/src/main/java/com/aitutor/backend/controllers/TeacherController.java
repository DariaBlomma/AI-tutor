package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.student.StudentBriefResponse;
import com.aitutor.backend.security.CustomUserDetails;
import com.aitutor.backend.services.teacher.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;

    @GetMapping("/students")
    public List<StudentBriefResponse> getMyStudents(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return teacherService.getMyStudents(userDetails.getId());
    }
}