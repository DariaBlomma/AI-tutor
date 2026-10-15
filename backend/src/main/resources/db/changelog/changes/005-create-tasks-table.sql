-- liquibase formatted sql

--changeset daria:005-create-tasks-table
--comment: Контейнер задания (то, что назначается ученику)
--comment: context - Общий контекст задания (текст для чтения, список заголовков для matching и т.п.)
-- Пустой NULL = задание без общего материала (например, чистый word formation).
-- Формат JSON: {"text": "...", "title": "..."} — структура свободная, зависит от типов задания.
CREATE TABLE tasks (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(200) NOT NULL,
                       is_mixed BOOLEAN DEFAULT FALSE,
                       context JSONB,
                       created_by BIGINT NOT NULL,            -- ID учителя
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                       CONSTRAINT fk_task_teacher FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

--rollback DROP TABLE IF EXISTS tasks;