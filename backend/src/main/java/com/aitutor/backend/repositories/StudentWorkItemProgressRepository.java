package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.StudentWorkItemProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentWorkItemProgressRepository extends JpaRepository<StudentWorkItemProgress, Long> {

    /**
     * Прогресс по всем пунктам одной работы для отчёта учителя (уровень 3) — вместе с самим
     * пунктом задания (fetch), чтобы достать prompt / correct_answer без N+1 запросов.
     * Пункты удалённых заданий в отчёт не попадают (t.deletedAt IS NULL).
     */
    @Query("""
            SELECT p FROM StudentWorkItemProgress p
            JOIN FETCH p.taskItem ti
            JOIN FETCH ti.task t
            WHERE p.studentWork.id = :workId
              AND t.deletedAt IS NULL
            """)
    List<StudentWorkItemProgress> findByWorkIdWithItem(@Param("workId") Long workId);
}
