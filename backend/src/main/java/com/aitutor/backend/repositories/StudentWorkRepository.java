package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.StudentWork;
import com.aitutor.backend.enums.WorkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface StudentWorkRepository extends JpaRepository<StudentWork, Long> {

    Optional<StudentWork> findByIdAndDeletedAtIsNull(Long id);

    /** Активные (не удалённые) назначения ученика: свежие сверху — список «Мои задания». */
    List<StudentWork> findByStudentIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long studentId);

    /** Активные назначения ученика по конкретному заданию — проверка дубля при назначении. */
    @Query("""
            SELECT sw FROM StudentWork sw
            WHERE sw.student.id = :studentId
              AND sw.task.id = :taskId
              AND sw.deletedAt IS NULL
              AND sw.status IN (com.aitutor.backend.enums.WorkStatus.ASSIGNED,
                                com.aitutor.backend.enums.WorkStatus.IN_PROGRESS)
            """)
    List<StudentWork> findActiveByStudentAndTask(@Param("studentId") Long studentId,
                                                 @Param("taskId") Long taskId);

    /** Множество task_id с активным назначением — пакетная проверка дублей при назначении. */
    @Query("""
            SELECT sw.task.id FROM StudentWork sw
            WHERE sw.student.id = :studentId
              AND sw.task.id IN :taskIds
              AND sw.deletedAt IS NULL
              AND sw.status IN (com.aitutor.backend.enums.WorkStatus.ASSIGNED,
                                com.aitutor.backend.enums.WorkStatus.IN_PROGRESS)
            """)
    Set<Long> findActiveTaskIds(@Param("studentId") Long studentId,
                                @Param("taskIds") List<Long> taskIds);

    /**
     * Автоперевод в EXPIRED: просроченные активные назначения с дедлайном.
     * Условие по статусу защищает от перезаписи COMPLETED, если задание сдали в последний момент.
     */
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE StudentWork sw
            SET sw.status = com.aitutor.backend.enums.WorkStatus.EXPIRED
            WHERE sw.deletedAt IS NULL
              AND sw.deadline IS NOT NULL
              AND sw.deadline < :now
              AND sw.status IN (com.aitutor.backend.enums.WorkStatus.ASSIGNED,
                                com.aitutor.backend.enums.WorkStatus.IN_PROGRESS)
            """)
    int expireOverdue(@Param("now") Instant now);
}
