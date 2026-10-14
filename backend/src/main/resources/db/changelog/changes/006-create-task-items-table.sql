-- liquibase formatted sql

--changeset daria:006-create-task-items-table
--comment: Состав задания (связь tasks и word_formation_library)
CREATE TABLE task_items (
                            id BIGSERIAL PRIMARY KEY,
                            task_id BIGINT NOT NULL,
                            library_item_id BIGINT NOT NULL,       -- Ссылка на элемент из банка
                            item_order INT NOT NULL,               -- Порядок слов

                            CONSTRAINT fk_task_item_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                            CONSTRAINT fk_task_item_library FOREIGN KEY (library_item_id) REFERENCES word_formation_library(id) ON DELETE RESTRICT
);

CREATE INDEX idx_task_items_task ON task_items(task_id);

--rollback DROP TABLE IF EXISTS task_items;