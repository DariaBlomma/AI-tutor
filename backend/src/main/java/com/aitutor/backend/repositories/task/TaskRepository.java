package com.aitutor.backend.repositories.task;

import com.aitutor.backend.entities.Task;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /** Тот же полный граф по публичному id (T-000123) — для страницы детального просмотра. */
    @EntityGraph(attributePaths = {"topics", "taskTypes", "items"})
    Optional<Task> findWithRelationsByPublicId(String publicId);

    /**
     * Пересчёт флага is_mixed после изменений в справочнике типов (деактивация/удаление типа).
     * Смешанным считается задание с 2+ АКТИВНЫМИ типами (неактивные/soft-deleted не считаются):
     * иначе деактивация одного из двух типов навсегда «ломает» строгий поиск по заданию.
     */
    @Modifying
    @Query("UPDATE Task t SET t.isMixed = CASE " +
            "WHEN (SELECT COUNT(tt) FROM Task t2 JOIN t2.taskTypes tt WHERE t2 = t AND tt.isActive = TRUE AND tt.deletedAt IS NULL) > 1 THEN true " +
            "ELSE false END " +
            "WHERE t.deletedAt IS NULL")
    void recalculateMixedFlags();

    /** Точечный пересчёт is_mixed для одного задания — вызывается при привязке/отвязке типов в TaskService. */
    @Modifying
    @Query("""
            UPDATE Task t SET t.isMixed = (
                SELECT COUNT(tt) FROM Task t2 JOIN t2.taskTypes tt
                WHERE t2 = t AND tt.isActive = TRUE AND tt.deletedAt IS NULL
            ) >= 2
            WHERE t.id = :taskId
            """)
    void recalculateMixedFlag(@Param("taskId") Long taskId);

    /** Список с полным графом (topics, taskTypes, items) за фиксированное число запросов — против N+1 в банке заданий. */
    @EntityGraph(attributePaths = {"topics", "taskTypes", "items"})
    List<Task> findAllByIdIn(List<Long> ids);

    /**
     * Пагинированный вариант: тот же полный граф, но только для id текущей страницы.
     * COUNT-запрос считает сами задания (distinct по task), без раздувания collection-join'ами.
     */
    @EntityGraph(attributePaths = {"topics", "taskTypes", "items"})
    @Query(value = "SELECT t FROM Task t WHERE t.id IN :ids",
           countQuery = "SELECT COUNT(t) FROM Task t WHERE t.id IN :ids")
    Page<Task> findPageByIdIn(@Param("ids") List<Long> ids, Pageable pageable);
}
