package com.aitutor.backend.repositories.course;

import com.aitutor.backend.entities.CourseTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseTaskRepository extends JpaRepository<CourseTask, Long> {

    /**
     * Задания курса с полным графом задания (topics, taskTypes, items) за фиксированное
     * число запросов — против N+1 при отдаче состава курса.
     */
    @Query("""
            SELECT ct FROM CourseTask ct
            JOIN FETCH ct.task t
            LEFT JOIN FETCH t.topics
            LEFT JOIN FETCH t.taskTypes
            LEFT JOIN FETCH t.items
            WHERE ct.course.id = :courseId
            ORDER BY ct.position ASC
            """)
    List<CourseTask> findWithTasksByCourseId(@Param("courseId") Long courseId);

    List<CourseTask> findByCourseIdOrderByPositionAsc(Long courseId);

    Optional<CourseTask> findByCourseIdAndTaskId(Long courseId, Long taskId);

    boolean existsByCourseIdAndTaskId(Long courseId, Long taskId);

    /**
     * Id курсов учителя, куда включено задание — один SELECT вместо N проверок
     * existsByCourseIdAndTaskId для попапа «Добавить в курс» (страница просмотра задания).
     */
    @Query("""
            SELECT ct.course.id FROM CourseTask ct
            WHERE ct.task.id = :taskId AND ct.course.teacher.id = :teacherId
            """)
    List<Long> findCourseIdsByTaskId(@Param("teacherId") Long teacherId, @Param("taskId") Long taskId);

    int countByCourseId(Long courseId);

    @Modifying
    void deleteByCourseIdAndTaskId(Long courseId, Long taskId);

    /**
     * Сдвиг плотного хвоста позиций на +1 перед вставкой нового задания в середину курса.
     * Вызывается ДО сохранения новой связи; при последующем flush Hibernate сначала
     * выполняет UPDATE'ы, затем INSERT — UNIQUE (course_id, position) не конфликтует.
     */
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE CourseTask ct
            SET ct.position = ct.position + 1
            WHERE ct.course.id = :courseId AND ct.position >= :fromPosition
            """)
    void shiftPositionsFrom(@Param("courseId") Long courseId, @Param("fromPosition") int fromPosition);
}
