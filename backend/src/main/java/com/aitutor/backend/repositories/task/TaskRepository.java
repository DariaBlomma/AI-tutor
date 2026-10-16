package com.aitutor.backend.repositories.task;

import com.aitutor.backend.entities.Task;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    /** Полный граф: темы, типы и контент — для детальной карточки задания. */
    @EntityGraph(attributePaths = {"topics", "taskTypes", "items"})
    Optional<Task> findWithRelationsById(Long id);

    long countByDeletedAtIsNull();

    /**
     * Пересчёт флага is_mixed после деактивации типа в справочнике.
     * Смешанным считается задание с 2+ АКТИВНЫМИ типами (неактивные/soft-deleted не считаются):
     * иначе деактивация одного из двух типов навсегда «ломает» строгий поиск по заданию.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Task t SET t.isMixed = (
                SELECT COUNT(tt) FROM Task t2 JOIN t2.taskTypes tt
                WHERE t2 = t AND tt.isActive = TRUE AND tt.deletedAt IS NULL
            ) >= 2
            WHERE t.deletedAt IS NULL
              AND t.isMixed <> (
                SELECT COUNT(tt2) FROM Task t3 JOIN t3.taskTypes tt2
                WHERE t3 = t AND tt2.isActive = TRUE AND tt2.deletedAt IS NULL
            ) >= 2
            """)
    void recalculateMixedFlags();

    /**
     * Точечный UPDATE public_id сразу после INSERT (см. TaskService.create):
     * при IDENTITY-стратегии id известен только после вставки, а генерация в @PrePersist падала.
     */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE Task t SET t.publicId = :publicId WHERE t.id = :id")
    void updatePublicId(@Param("id") Long id, @Param("publicId") String publicId);

    /** Список с полным графом (topics, taskTypes, items) за фиксированное число запросов — против N+1 в банке заданий. */
    @EntityGraph(attributePaths = {"topics", "taskTypes", "items"})
    List<Task> findAllByIdIn(List<Long> ids);
}
