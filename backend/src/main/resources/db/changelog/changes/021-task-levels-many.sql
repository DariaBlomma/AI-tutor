-- liquibase formatted sql

-- changeset aitutor:021-task-levels-many
-- Comment(s): уровень языка становится множественным и обязательным: связующая таблица task_levels
-- (аналог task_topics). Старый одиночный tasks.task_level переносится в таблицу, затем удаляется.
CREATE TABLE task_levels (
                             task_id BIGINT NOT NULL,
                             level VARCHAR(4) NOT NULL,

                             PRIMARY KEY (task_id, level),

                             CONSTRAINT fk_tl_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                             CONSTRAINT fk_tl_level CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1'))
);

-- Переносим уровни из старой колонки (задания без уровня останутся без него до ручного заполнения).
INSERT INTO task_levels (task_id, level)
SELECT id, task_level FROM tasks WHERE task_level IS NOT NULL;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_tasks_level;
DROP INDEX IF EXISTS idx_tasks_level;
ALTER TABLE tasks DROP COLUMN IF EXISTS task_level;

-- rollback ALTER TABLE tasks ADD COLUMN task_level VARCHAR(4);
-- rollback INSERT INTO tasks (id, task_level) SELECT task_id, level FROM task_levels WHERE level IN ('A1','A2','B1','B2','C1');
-- rollback DROP TABLE IF EXISTS task_levels;
