package com.aitutor.backend.repositories.task;

import com.aitutor.backend.entities.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskItemRepository extends JpaRepository<TaskItem, Long> {
    List<TaskItem> findByTaskIdOrderByPositionAsc(Long taskId);
    void deleteByTaskId(Long taskId);
}