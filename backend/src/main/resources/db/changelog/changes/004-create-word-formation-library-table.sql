-- liquibase formatted sql

--changeset daria:004-create-word-formation-library-table
--comment: Банк эталонных заданий на словообразование
CREATE TABLE word_formation_library (
                                        id BIGSERIAL PRIMARY KEY,
                                        base_word VARCHAR(50) NOT NULL,
                                        sentence_with_blank TEXT NOT NULL,
                                        correct_answer VARCHAR(100) NOT NULL,  -- Поддержка нескольких ответов через слэш
                                        topic_id BIGINT,                       -- Опциональная тема
                                        created_by BIGINT NOT NULL,            -- ID учителя
                                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                                        CONSTRAINT fk_library_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
                                        CONSTRAINT fk_library_teacher FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_library_topic ON word_formation_library(topic_id);

--rollback DROP TABLE IF EXISTS word_formation_library;