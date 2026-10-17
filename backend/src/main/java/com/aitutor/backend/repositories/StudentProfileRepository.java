package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    List<StudentProfile> findByTeacherId(Long teacherId);

    Optional<StudentProfile> findByUserId(Long userId);
}