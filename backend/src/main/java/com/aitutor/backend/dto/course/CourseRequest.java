package com.aitutor.backend.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Создание/переименование курса. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {

    @NotBlank(message = "Название курса обязательно")
    @Size(max = 200, message = "Название курса не длиннее 200 символов")
    private String name;
}
