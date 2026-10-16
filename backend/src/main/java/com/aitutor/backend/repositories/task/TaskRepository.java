package com.aitutor.backend.repositories.task;

import com.aitutor.backend.entities.Task;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    /** Полный граф: темы, типы и контент — для детальной карточки задания. */
    @EntityGraph(attributePaths = {"topics", "taskTypes", "items"})
    Optional<Task> findWithRelationsById(Long id);

    long countByDeletedAtIsNull();
}
