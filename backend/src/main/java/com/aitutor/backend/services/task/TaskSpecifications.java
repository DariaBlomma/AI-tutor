package com.aitutor.backend.services.task;

import com.aitutor.backend.entities.Task;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

/**
 * Фильтры банка заданий. Всегда добавляют условие soft-delete (deleted_at IS NULL).
 */
public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    /** Только неудалённые задания. */
    public static Specification<Task> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    /**
     * Фильтр по типу задания.
     * includeMixed=false (строгий поиск) — только "чистые" задания выбранного типа (is_mixed = false).
     * includeMixed=true  (расширенный) — все задания, где встречается тип, включая смешанные.
     */
    public static Specification<Task> byTaskType(Long taskTypeId, boolean includeMixed) {
        return (root, query, cb) -> {
            if (taskTypeId == null) {
                return cb.conjunction();
            }
            Join<Object, Object> types = root.join("taskTypes");
            Predicate typeMatches = cb.equal(types.get("id"), taskTypeId);
            if (includeMixed) {
                return typeMatches;
            }
            return cb.and(typeMatches, cb.isFalse(root.get("isMixed")));
        };
    }

    /** Поиск по названию или публичному id (TSK-1), регистронезависимо. */
    public static Specification<Task> byNameOrPublicId(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            String like = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("publicId")), like)
            );
        };
    }
}
