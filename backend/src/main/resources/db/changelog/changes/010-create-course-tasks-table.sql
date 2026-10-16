-- liquibase formatted sql

--changeset daria:010-create-course-tasks-table
--comment: Связующая таблица для связи курсов и заданий (Many-to-Many), position — порядок задания в курсе
CREATE TABLE course_tasks (
                              id BIGSERIAL PRIMARY KEY,
                              course_id BIGINT NOT NULL,
                              task_id BIGINT NOT NULL,
                              position INT NOT NULL DEFAULT 0,
                              added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                              CONSTRAINT fk_ct_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                              CONSTRAINT fk_ct_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                              CONSTRAINT uq_course_task UNIQUE (course_id, task_id) -- Запрет дубликатов в одном курсе
);

-- Индексы для быстрого поиска заданий внутри курса и курсов, куда входит задание.
-- Уникальный индекс: порядок (position) не может повторяться внутри курса —
-- страховка от гонок при перетаскивании на фронте (переупорядочивание идёт в одной транзакции).
CREATE INDEX idx_course_tasks_task ON course_tasks(task_id);
CREATE UNIQUE INDEX uq_course_tasks_course_position ON course_tasks(course_id, position);

--rollback DROP TABLE IF EXISTS course_tasks;