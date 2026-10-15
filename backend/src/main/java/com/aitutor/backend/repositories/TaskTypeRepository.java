package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskTypeRepository extends JpaRepository<TaskType, Long> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    List<TaskType> findByIsActiveTrueOrderByNameAsc();
}