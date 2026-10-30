-- liquibase formatted sql

-- changeset aitutor:022-task-levels-drop-order splitStatements:false
-- Comment(s): уровни CEFR — это набор тегов задания (как task_topics / task_task_types), порядок в нём
-- не имеет смысла, поэтому в entities/Task.java коллекция levels объявлена как Set без @OrderColumn.
-- Если на базе уже применён прежний changeset 022-task-levels-order, добавивший в task_levels служебную
-- колонку позиции levels_order и переставивший PK на (task_id, levels_order), здесь схема приводится
-- обратно к каноничной для набора: PK (task_id, level). Дубли пар схлопываются DISTINCT-ом.
-- На чистых базах и на базах, где 022-task-levels-order не применялся, скрипт не делает ничего —
-- база не чистится, миграция идемпотентна.
-- splitStatements:false обязателен: Liquibase режет SQL по ";", в том числе внутри dollar-кавычек,
-- и DO $$ ... $$ превращается в «Unterminated dollar quote». Поэтому блок пишется только если
-- колонка реально существует (проверка EXISTS — обычный запрос, он безопасно выполняется всегда).
CREATE TABLE pg_temp.tl_dedup AS SELECT DISTINCT task_id, level FROM task_levels;

INSERT INTO task_levels (task_id, level)
SELECT task_id, level FROM pg_temp.tl_dedup
WHERE EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'task_levels' AND column_name = 'levels_order');

DELETE FROM task_levels a
WHERE EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name = 'task_levels' AND column_name = 'levels_order')
  AND a.ctid > (SELECT b.ctid FROM task_levels b
               WHERE b.task_id = a.task_id AND b.level = a.level);

ALTER TABLE task_levels DROP CONSTRAINT IF EXISTS task_levels_pkey;

ALTER TABLE task_levels DROP COLUMN IF EXISTS levels_order;

ALTER TABLE task_levels
    ADD CONSTRAINT task_levels_pkey PRIMARY KEY (task_id, level);

DROP TABLE pg_temp.tl_dedup;

-- rollback отсутствует: удаляем служебную колонку, которую сущность больше не использует;
-- сами уровни (task_id, level) остаются нетронутыми.
