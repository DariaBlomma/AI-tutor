package com.aitutor.backend.mappers.teacher;

import com.aitutor.backend.dto.student.StudentBriefResponse;
import com.aitutor.backend.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TeacherMapper {
    StudentBriefResponse toStudentBriefResponse(User user);
    List<StudentBriefResponse> toStudentBriefResponseList(List<User> users);
}