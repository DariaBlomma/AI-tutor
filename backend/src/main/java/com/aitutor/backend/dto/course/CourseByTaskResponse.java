package com.aitutor.backend.dto.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Курс в списке «мои курсы» для выбора в попапе «Добавить в курс» (страница просмотра задания).
 * hasTask — задание уже входит в курс: в попапе этот курс предлагается убрать, а не добавить.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseByTaskResponse {

    private Long id;
    private String name;
    private boolean hasTask;
}
