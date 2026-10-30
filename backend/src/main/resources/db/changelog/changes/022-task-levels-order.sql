-- liquibase formatted sql

-- changeset aitutor:022-task-levels-order
-- Comment(s): доводка схемы task_levels под @ElementCollection + @OrderColumn из entities/Task.java.
-- Изменениеets 021 создавало таблицу без служебной колонки позиции, поэтому ddl-auto=validate падал с
-- "Schema validation: missing column [levels_order] in table [task_levels]" (Hibernate именует её по
-- атрибуту levels + суффиксу _order). Отдельный changeset вместо правки 021 нужен потому, что на БД,
-- где 021 уже применён, Liquibase повторно его не выполняет — иначе помогла бы только очистка базы.
-- IF NOT EXISTS / IF NOT EXISTS-проверки делают миграцию идемпотентной и для чистых, и для «старых» баз.
ALTER TABLE task_levels
    ADD COLUMN IF NOT EXISTS levels_order INT;

-- Существующие строки — одиночные уровни, перенесённые из tasks.task_level: позиция 0.
UPDATE task_levels SET levels_order = 0 WHERE levels_order IS NULL;

-- Уникальность пары (task_id, level) больше не нужна (позиция в списке важнее), а PK по ней мешал бы
-- хранить два уровня у одного задания; заменяем PK на (task_id, levels_order) — как раз то, что ожидает
-- Hibernate для упорядоченной коллекции.
ALTER TABLE task_levels DROP CONSTRAINT IF EXISTS task_levels_pkey;
ALTER TABLE task_levels
    ALTER COLUMN levels_order SET NOT NULL;
ALTER TABLE task_levels
    ADD CONSTRAINT task_levels_pkey PRIMARY KEY (task_id, levels_order);

CREATE INDEX IF NOT EXISTS idx_task_levels_task ON task_levels (task_id);

-- rollback ALTER TABLE task_levels DROP CONSTRAINT IF EXISTS task_levels_pkey;
-- rollback DROP INDEX IF EXISTS idx_task_levels_task;
-- rollback ALTER TABLE task_levels ADD CONSTRAINT task_levels_pkey PRIMARY KEY (task_id, level);
-- rollback ALTER TABLE task_levels DROP COLUMN IF EXISTS levels_order;
