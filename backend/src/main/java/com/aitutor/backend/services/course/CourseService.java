package com.aitutor.backend.services.course;

import com.aitutor.backend.dto.course.CourseRequest;
import com.aitutor.backend.dto.course.CourseResponse;
import com.aitutor.backend.dto.course.CourseSummaryResponse;
import com.aitutor.backend.dto.course.CourseTaskAddRequest;
import com.aitutor.backend.entities.Course;
import com.aitutor.backend.entities.CourseTask;
import com.aitutor.backend.entities.Task;
import com.aitutor.backend.exceptions.ConflictException;
import com.aitutor.backend.exceptions.InvalidRequestException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.mappers.TaskMapper;
import com.aitutor.backend.repositories.UserRepository;
import com.aitutor.backend.repositories.course.CourseRepository;
import com.aitutor.backend.repositories.course.CourseTaskRepository;
import com.aitutor.backend.repositories.task.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Курсы — «плейлисты» из заданий банка. Задания не копируются: курс хранит только
 * связи (course_tasks), контент меняется в банке и автоматически отражается в курсе.
 */
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseTaskRepository courseTaskRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> getAll(Long teacherId) {
        return courseRepository.findByTeacherIdAndDeletedAtIsNullOrderByCreatedAtDesc(teacherId)
                .stream()
                .map(c -> CourseSummaryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .taskCount(courseTaskRepository.countByCourseId(c.getId()))
                        .createdAt(c.getCreatedAt())
                        .updatedAt(c.getUpdatedAt())
                        .build())
                .toList();
    }

    /** Детали курса: состав заданий, упорядоченный по position. */
    @Transactional(readOnly = true)
    public CourseResponse getById(Long id, Long teacherId) {
        Course course = findOwnedActiveCourse(id, teacherId);
        List<CourseResponse.OrderedTask> tasks = courseTaskRepository.findWithTasksByCourseId(course.getId())
                .stream()
                .map(ct -> CourseResponse.OrderedTask.builder()
                        .position(ct.getPosition())
                        .task(taskMapper.toSummary(ct.getTask()))
                        .build())
                .toList();
        return CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .tasks(tasks)
                .build();
    }

    @Transactional
    public CourseResponse create(CourseRequest request, Long teacherId) {
        String name = request.getName().trim();
        if (courseRepository.existsActiveByTeacherIdAndName(teacherId, name)) {
            throw new ConflictException("Курс с названием '" + name + "' уже существует");
        }
        var teacher = userRepository.findActiveById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Учитель не найден: id=" + teacherId));
        Course course = Course.builder().name(name).teacher(teacher).build();
        // flush обязателен: getId() после persist при IDENTITY требует завершённого INSERT
        courseRepository.saveAndFlush(course);
        return getById(course.getId(), teacherId);
    }

    @Transactional
    public CourseResponse update(Long id, CourseRequest request, Long teacherId) {
        Course course = findOwnedActiveCourse(id, teacherId);
        String name = request.getName().trim();
        if (courseRepository.existsActiveByTeacherIdAndName(teacherId, name)
                && !course.getName().equalsIgnoreCase(name)) {
            throw new ConflictException("Курс с названием '" + name + "' уже существует");
        }
        course.setName(name);
        course.setUpdatedAt(Instant.now());
        return getById(course.getId(), teacherId);
    }

    /** Мягкое удаление курса; связи course_tasks остаются в БД как история (FK ON DELETE CASCADE сработает только при физическом удалении). */
    @Transactional
    public void delete(Long id, Long teacherId) {
        Course course = findOwnedActiveCourse(id, teacherId);
        course.setDeletedAt(Instant.now());
    }

    /**
     * Добавить задание из банка в курс. position=null — в конец; иначе хвост сдвигается
     * на +1 одним UPDATE перед вставкой (UNIQUE (course_id, position) не конфликтует:
     * Hibernate выполняет UPDATE'ы раньше INSERT при flush).
     */
    @Transactional
    public CourseResponse addTask(Long courseId, CourseTaskAddRequest request, Long teacherId) {
        Course course = findOwnedActiveCourse(courseId, teacherId);

        Task task = taskRepository.findWithRelationsById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Задание не найдено: id=" + request.getTaskId()));
        if (task.getDeletedAt() != null) {
            throw new InvalidRequestException("Нельзя добавить удалённое задание в курс");
        }
        if (courseTaskRepository.existsByCourseIdAndTaskId(course.getId(), task.getId())) {
            throw new ConflictException("Задание уже в курсе: id=" + task.getId());
        }

        int size = courseTaskRepository.countByCourseId(course.getId());
        int position = resolvePosition(request.getPosition(), size);
        if (position < size) {
            courseTaskRepository.shiftPositionsFrom(course.getId(), position);
        }
        courseTaskRepository.save(CourseTask.builder()
                .course(course)
                .task(task)
                .position(position)
                .build());
        // flush до чтения: getById идёт отдельным SELECT-запросом (JPQL), а не по managed-графу,
        // и без явной вставки связи новая строка в него бы не попала
        courseTaskRepository.flush();
        return getById(course.getId(), teacherId);
    }

    /** Убрать задание из курса: удаляется связь, задание остаётся в банке. Позиции уплотняются. */
    @Transactional
    public CourseResponse removeTask(Long courseId, Long taskId, Long teacherId) {
        Course course = findOwnedActiveCourse(courseId, teacherId);
        CourseTask link = courseTaskRepository.findByCourseIdAndTaskId(course.getId(), taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Задания нет в курсе: id=" + taskId));
        courseTaskRepository.delete(link);
        renumber(course.getId());
        return getById(course.getId(), teacherId);
    }

    /**
     * Новый порядок всего состава курса (drag-and-drop): список id, позиция = индекс.
     * Валидация: ровно те же задания, что уже в курсе, без дублей.
     * Промежуточные дубли UNIQUE (course_id, position) обходятся временным сдвигом
     * новых позиций в диапазон [size, 2*size): сначала UPDATE всех строк в «буфер»,
     * затем уплотнение в 0..N-1.
     */
    @Transactional
    public CourseResponse reorder(Long courseId, List<Long> taskIds, Long teacherId) {
        Course course = findOwnedActiveCourse(courseId, teacherId);
        List<CourseTask> links = courseTaskRepository.findWithTasksByCourseId(course.getId());

        if (taskIds.stream().distinct().count() != taskIds.size()) {
            throw new InvalidRequestException("В списке порядка есть повторяющиеся id заданий");
        }
        if (taskIds.size() != links.size()) {
            throw new InvalidRequestException(
                    "Список должен содержать все задания курса: ожидалось " + links.size() + ", получено " + taskIds.size());
        }
        var byTaskId = links.stream().collect(java.util.stream.Collectors.toMap(ct -> ct.getTask().getId(), ct -> ct));
        for (Long taskId : taskIds) {
            if (!byTaskId.containsKey(taskId)) {
                throw new InvalidRequestException("Задания нет в курсе: id=" + taskId);
            }
        }

        int size = links.size();
        // фаза 1: новые позиции + offset — никаких пересечений со старыми 0..size-1
        for (int i = 0; i < size; i++) {
            byTaskId.get(taskIds.get(i)).setPosition(size + i);
        }
        courseTaskRepository.saveAll(links);
        courseTaskRepository.flush();
        // фаза 2: уплотнение в 0..size-1
        for (int i = 0; i < size; i++) {
            byTaskId.get(taskIds.get(i)).setPosition(i);
        }
        courseTaskRepository.saveAll(links);
        courseTaskRepository.flush();
        return getById(course.getId(), teacherId);
    }

    /** Позиция 0..size (size = «в конец»), null тоже в конец; всё остальное — 400. */
    private int resolvePosition(Integer requested, int size) {
        if (requested == null) {
            return size;
        }
        if (requested < 0 || requested > size) {
            throw new InvalidRequestException("Некорректная позиция: " + requested + " (допустимо 0.." + size + ")");
        }
        return requested;
    }

    /** Перенумерация плотного ряда позиций 0..N-1 после удаления связи. */
    private void renumber(Long courseId) {
        List<CourseTask> remaining = courseTaskRepository.findByCourseIdOrderByPositionAsc(courseId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPosition(i);
        }
        courseTaskRepository.saveAll(remaining);
        courseTaskRepository.flush();
    }

    /** Курс виден и редактируется только его владельцем; чужой/удалённый курс — как несуществующий или 403. */
    private Course findOwnedActiveCourse(Long id, Long teacherId) {
        Course course = courseRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Курс не найден: id=" + id));
        if (!course.getTeacher().getId().equals(teacherId)) {
            throw new org.springframework.security.access.AccessDeniedException("Курс принадлежит другому учителю");
        }
        return course;
    }
}
