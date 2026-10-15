package com.aitutor.backend.services.teacher;

import com.aitutor.backend.dto.student.StudentBriefResponse;
import com.aitutor.backend.entities.StudentProfile;
import com.aitutor.backend.entities.User;
import com.aitutor.backend.mappers.teacher.TeacherMapper;
import com.aitutor.backend.repositories.student.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherService {
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherMapper teacherMapper;

    @Transactional(readOnly = true)
    public List<StudentBriefResponse> getMyStudents(Long teacherId) {
        List<StudentProfile> profiles = studentProfileRepository.findByTeacherId(teacherId);

        List<User> students = profiles.stream()
                .map(StudentProfile::getUser)
                .toList();

        return teacherMapper.toStudentBriefResponseList(students);
    }
}