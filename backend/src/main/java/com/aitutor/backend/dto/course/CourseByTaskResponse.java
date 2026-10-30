package com.aitutor.backend.dto.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Курс в списке «мои курсы» для выбора в попапе «Добавить в курс» (страница просмотра задания).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseByTaskResponse {

    private Long id;
    private String name;
}
