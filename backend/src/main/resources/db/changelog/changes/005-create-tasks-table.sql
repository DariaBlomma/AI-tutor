-- liquibase formatted sql

--changeset daria:005-create-tasks-table
--comment: Контейнер задания (то, что назначается ученику)
--comment: context - Общий контекст задания (текст для чтения, список заголовков для matching и т.п.)
-- Пустой NULL = задание без общего материала (например, чистый word formation).
-- Формат JSON строго фиксирован (валидируется на бэкенде, см. README «Формат контента заданий»):
--   {"type": "TEXT",  "title": "...", "text": "..."}  — текст для чтения (TFNS/MATCHING)
--   {"type": "AUDIO", "title": "...", "url": "..."}   — аудио-материал
CREATE TABLE tasks (
                       id BIGSERIAL PRIMARY KEY,
                       public_id VARCHAR(20) NOT NULL UNIQUE,     -- публичный id для UI и поиска (TSK-000123)
                       name VARCHAR(200) NOT NULL,
                       preview_text TEXT,                         -- превью для списка банка заданий
                       deleted_at TIMESTAMP WITH TIME ZONE,       -- мягкое удаление
                       is_mixed BOOLEAN DEFAULT FALSE,
                       context JSONB,
                       created_by BIGINT NOT NULL,            -- ID учителя
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                       CONSTRAINT fk_task_teacher FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

--rollback DROP TABLE IF EXISTS tasks;