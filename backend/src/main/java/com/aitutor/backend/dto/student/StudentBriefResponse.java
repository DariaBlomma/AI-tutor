package com.aitutor.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class StudentBriefResponse {
    private Long id;
    private String userName;
    private String firstName;
    private String lastName;
    private String email;
}