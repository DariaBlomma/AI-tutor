package com.aitutor.backend.mappers;

import com.aitutor.backend.dto.auth.SignUpRequest;
import com.aitutor.backend.dto.user.TeacherBriefDto;
import com.aitutor.backend.dto.user.UserResponse;
import com.aitutor.backend.dto.user.UserResponseWithPassword;
import com.aitutor.backend.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    // role маппится из запроса (выбирается в UI); password и teacherCode сервис заполняет сам
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "teacherCode", ignore = true)
    User toEntityWithoutPassword(SignUpRequest request);

    // teacher (привязанный учитель ученика) сервис заполняет сам — из student_profiles
    @Mapping(target = "teacher", ignore = true)
    UserResponse toResponse(User user);

    @Mapping(target = "teacher", ignore = true)
    UserResponseWithPassword toResponseWithPassword(User user);

    UserResponse fromWithPasswordToResponse(UserResponseWithPassword user);

    /** User(роль TEACHER) -> краткий профиль для поля teacher у ученика. */
    default TeacherBriefDto toTeacherBrief(User teacher) {
        if (teacher == null) {
            return null;
        }
        String first = teacher.getFirstName();
        String last = teacher.getLastName();
        String fullName = ((first == null ? "" : first.trim()) + " " + (last == null ? "" : last.trim())).trim();
        return TeacherBriefDto.builder()
                .id(teacher.getId())
                .userName(teacher.getUserName())
                .firstName(first)
                .lastName(last)
                .fullName(fullName.isEmpty() ? teacher.getUserName() : fullName)
                .teacherCode(teacher.getTeacherCode())
                .build();
    }
}