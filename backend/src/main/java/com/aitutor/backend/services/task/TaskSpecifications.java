package com.aitutor.backend.services.task;

import com.aitutor.backend.entities.Course;
import com.aitutor.backend.entities.CourseTask;
import com.aitutor.backend.entities.Task;
import com.aitutor.backend.entities.TaskItem;
import com.aitutor.backend.enums.ItemType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

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
     * Фильтр по типу задания + смешанности.
     * Тип выбран: задание подходит, если этот тип среди его типов; при includeMixed=false
     * дополнительно требуется «чистота» задания — ровно один тип (считаем по составу taskTypes,
     * а не по денормализованному флагу is_mixed, который могут забыть пересчитать).
     * Тип не выбран: includeMixed=false скрывает смешанные (2+ типов) задания,
     * includeMixed=true — без ограничений.
     */
    public static Specification<Task> byTaskType(Long taskTypeId, boolean includeMixed) {
        return (root, query, cb) -> {
            Predicate typeMatches = cb.conjunction();
            if (taskTypeId != null) {
                Join<Object, Object> types = root.join("taskTypes");
                typeMatches = cb.equal(types.get("id"), taskTypeId);
            }
            if (includeMixed) {
                return typeMatches;
            }
            Subquery<Long> countSub = query.subquery(Long.class);
            Root<Task> t2 = countSub.from(Task.class);
            countSub.select(cb.count(t2.join("taskTypes")))
                    .where(cb.equal(t2.get("id"), root.get("id")));
            return cb.and(typeMatches, cb.lessThanOrEqualTo(countSub, 1L));
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
     * Фильтр по уровню CEFR (enum CefrLevel: A1..C1): задание подходит, если уровень есть в его списке.
     * Задания без уровней (старые данные до заполнения) при выбранном фильтре не попадают.
     */
    public static Specification<Task> byLevel(com.aitutor.backend.enums.CefrLevel level) {
        return (root, query, cb) -> level == null
                ? cb.conjunction()
                : cb.isMember(level, root.get("levels"));
    }

    /**
     * Фильтр по типу экзамена (enum ExamType: OGE / EGE). Задания без экзамена при фильтре не попадают.
     */
    public static Specification<Task> byExamType(com.aitutor.backend.enums.ExamType examType) {
        return (root, query, cb) -> examType == null
                ? cb.conjunction()
                : cb.equal(root.get("examType"), examType);
    }

    /**
     * Фильтр по курсам (мультиселект на странице банка заданий): оставляем задания,
     * которые входят хотя бы в один из выбранных активных (не удалённых) курсов.
     * EXISTS + correlated join вместо count-подзапроса — без дублей строк на пагинации.
     */
    public static Specification<Task> byCourses(List<Long> courseIds) {
        return (root, query, cb) -> {
            if (courseIds == null || courseIds.isEmpty()) {
                return cb.conjunction();
            }
            Subquery<Long> sub = query.subquery(Long.class);
            Root<CourseTask> ct = sub.from(CourseTask.class);
            Join<CourseTask, Course> course = ct.join("course");
            sub.select(cb.literal(1L))
                    .where(cb.and(
                            cb.equal(ct.get("task"), root),
                            course.get("id").in(courseIds),
                            cb.isNull(course.get("deletedAt"))
                    ));
            return cb.exists(sub);
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
