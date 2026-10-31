package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.StudentWork;
import com.aitutor.backend.enums.WorkStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /** Пагинация «Моих заданий» с сортировкой на уровне БД (см. SORT_WHITELIST в сервисе). */
    Page<StudentWork> findByStudentIdAndDeletedAtIsNull(Long studentId, Pageable pageable);

    /**
     * Активные назначения ученика (ASSIGNED / IN_PROGRESS) — база для краткого прогресса:
     * COMPLETED / EXPIRED / CANCELLED в «2 из 5» не учитываются (только актуальные по времени).
     */
    List<StudentWork> findActiveByStudent(Long studentId);

    /** То же, но списком id — чтобы агрегаты по прогрессу одним запросом (см. ProgressOverviewDto). */
    @Query("""
            SELECT sw.id FROM StudentWork sw
            WHERE sw.student.id = :studentId
              AND sw.deletedAt IS NULL
              AND sw.status IN (com.aitutor.backend.enums.WorkStatus.ASSIGNED,
                                com.aitutor.backend.enums.WorkStatus.IN_PROGRESS)
            """)
    List<Long> findActiveWorkIds(@Param("studentId") Long studentId);

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

    /**
     * Есть ли у задания незавершённые назначения (ASSIGNED / IN_PROGRESS) — блокировка
     * содержательных полей при редактировании (TaskService#update). Удалённые (CANCELLED-soft) не считаем.
     */
    boolean existsByTaskIdAndDeletedAtIsNullAndStatusIn(Long taskId, Set<WorkStatus> statuses);

    /**
     * Есть ли у задания сдачи (COMPLETED). deletedAt НЕ фильтруем: удалённое назначение
     * не отменяет того, что ученик уже решал задание и видел его текст и ответы.
     */
    boolean existsByTaskIdAndStatus(Long taskId, WorkStatus status);

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
