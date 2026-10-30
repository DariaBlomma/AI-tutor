-- liquibase formatted sql

-- changeset aitutor:020-tasks-level-exam
-- Comment(s): tasks.task_level (CEFR A1-C1) и tasks.exam_type (OGE/EGE) — новые фильтры банка заданий.
-- Значения совпадают с enum-ами бэкенда CefrLevel / ExamType (EnumType.STRING); CHECK защищает от
-- мусора при ручных правках в БД. Колонки nullable: существующие задания остаются без уровня/экзамена.
ALTER TABLE tasks
    ADD COLUMN task_level VARCHAR(4),
    ADD COLUMN exam_type VARCHAR(30);

ALTER TABLE tasks
    ADD CONSTRAINT chk_tasks_level CHECK (task_level IN ('A1', 'A2', 'B1', 'B2', 'C1')),
    ADD CONSTRAINT chk_tasks_exam_type CHECK (exam_type IN ('OGE', 'EGE'));

CREATE INDEX idx_tasks_level ON tasks (task_level);
CREATE INDEX idx_tasks_exam_type ON tasks (exam_type);

-- rollback ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_tasks_level, DROP CONSTRAINT IF EXISTS chk_tasks_exam_type;
-- rollback DROP INDEX IF EXISTS idx_tasks_level, idx_tasks_exam_type;
-- rollback ALTER TABLE tasks DROP COLUMN IF EXISTS task_level, DROP COLUMN IF EXISTS exam_type;
