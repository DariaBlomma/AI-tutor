package com.aitutor.backend.repositories.course;

import com.aitutor.backend.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /** Список курсов учителя (без удалённых), новые сверху — как в банке заданий. */
    List<Course> findByTeacherIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long teacherId);

    Optional<Course> findByIdAndDeletedAtIsNull(Long id);

    /** Защита от одноимённых курсов у одного учителя (только по активным). */
    @Query("""
            SELECT COUNT(c) > 0 FROM Course c
            WHERE c.teacher.id = :teacherId
              AND LOWER(TRIM(c.name)) = LOWER(TRIM(:name))
              AND c.deletedAt IS NULL
            """)
    boolean existsActiveByTeacherIdAndName(@Param("teacherId") Long teacherId, @Param("name") String name);
}
