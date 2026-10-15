package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.Task;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @EntityGraph(attributePaths = {"topics", "taskTypes"})
    List<Task> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"topics", "taskTypes"})
    Optional<Task> findWithRelationsById(Long id);
}