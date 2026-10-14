-- liquibase formatted sql

--changeset daria:009-create-courses-table
--comment: Таблица курсов учителя (Spotlight 6, ЕГЭ 2026 и т.д.)
CREATE TABLE courses (
                         id BIGSERIAL PRIMARY KEY,
                         name VARCHAR(200) NOT NULL,
                         teacher_id BIGINT NOT NULL,          -- Владелец курса
                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         deleted_at TIMESTAMP,

                         CONSTRAINT fk_course_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_courses_teacher ON courses(teacher_id);

--rollback DROP TABLE IF EXISTS courses;