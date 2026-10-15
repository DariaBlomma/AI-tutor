-- liquibase formatted sql

--changeset daria:enable-pg-trgm
--comment: Расширение для поиска по подстроке (трigrams)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

--rollback DROP EXTENSION IF EXISTS pg_trgm;

-- liquibase formatted sql

--changeset daria:006-create-task-items-table
--comment: Пункты задания. Единая таблица на все форматы (кроме устной/письменной частей).
-- СОГЛАШЕНИЕ ОБ ИСПОЛЬЗОВАНИИ ПОЛЕЙ:
--   item_type      - формат пункта (см. enum ItemType), определяет, что лежит в content.
--   prompt         - основной текст вопроса/предложения. Для пропусков "___" отмечает место ответа.
--                    Всегда заполнен и индексируется — по нему работает поиск по содержимому.
--   correct_answer - эталонный ответ (текстовый). NULL для free-form заданий (раскройте скобки и т.п.,
--                    где проверка на стороне ИИ).
--   content        - JSONB со спецификой формата, ВСЁ остальное хранится здесь:
--                      GAP_FILL / WORD_FORMATION : {"options": ["..."], "explanation": "..."}
--                      TFNS                       : {"statement_id": ...} (сам текст — в tasks.context)
--                      MATCHING                   : {"left_label": "...", "right_label": "..."}
--   position       - порядок пункта внутри задания (сортировка учителем).
--   library_ref    - опциональная ссылка на заготовку из word_formation_library (для аудита происхождения).
CREATE TABLE task_items (
                            id BIGSERIAL PRIMARY KEY,
                            task_id BIGINT NOT NULL,
                            item_type VARCHAR(30) NOT NULL,
                            prompt TEXT NOT NULL,
                            correct_answer VARCHAR(200),
                            content JSONB,
                            position INT NOT NULL DEFAULT 0,
                            library_ref BIGINT,

                            CONSTRAINT fk_ti_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                            CONSTRAINT fk_ti_library FOREIGN KEY (library_ref) REFERENCES word_formation_library(id) ON DELETE SET NULL
);

CREATE INDEX idx_task_items_task_position ON task_items(task_id, position);
CREATE INDEX idx_task_items_prompt_trgm ON task_items USING gin (prompt gin_trgm_ops);

--rollback DROP INDEX IF EXISTS idx_task_items_prompt_trgm;
--rollback DROP INDEX IF EXISTS idx_task_items_task_position;
--rollback DROP TABLE IF EXISTS task_items;