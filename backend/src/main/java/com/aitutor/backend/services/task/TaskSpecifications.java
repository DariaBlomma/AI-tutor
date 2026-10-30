package com.aitutor.backend.services.task;

import com.aitutor.backend.entities.Task;
import com.aitutor.backend.entities.TaskItem;
import com.aitutor.backend.enums.ItemType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
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

    /**
     * Фильтр по механике пунктов (enum ItemType: WORD_FORMATION / GAP_FILL / TFNS / MATCHING).
     * Оставляем задания, у которых есть хотя бы один пункт выбранной механики.
     * Подзапрос EXISTS вместо join — иначе дубли строк ломали бы count/пагинацию.
     */
    public static Specification<Task> byItemType(ItemType itemType) {
        return (root, query, cb) -> {
            if (itemType == null) {
                return cb.conjunction();
            }
            Subquery<Long> sub = query.subquery(Long.class);
            Root<TaskItem> item = sub.from(TaskItem.class);
            sub.select(cb.literal(1L))
                    .where(cb.and(
                            cb.equal(item.get("task"), root),
                            cb.equal(item.get("itemType"), itemType)
                    ));
            return cb.exists(sub);
        };
    }

    /**
     * Фильтр по уровню CEFR (enum CefrLevel: A1..C1). Задания без уровня при выбранном фильтре не попадают.
     */
    public static Specification<Task> byLevel(com.aitutor.backend.enums.CefrLevel level) {
        return (root, query, cb) -> level == null
                ? cb.conjunction()
                : cb.equal(root.get("level"), level);
    }

    /**
     * Фильтр по типу экзамена (enum ExamType: OGE / EGE). Задания без экзамена при фильтре не попадают.
     */
    public static Specification<Task> byExamType(com.aitutor.backend.enums.ExamType examType) {
        return (root, query, cb) -> examType == null
                ? cb.conjunction()
                : cb.equal(root.get("examType"), examType);
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
