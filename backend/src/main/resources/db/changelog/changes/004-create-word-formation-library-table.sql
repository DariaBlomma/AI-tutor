-- liquibase formatted sql

--changeset daria:004-create-word-formation-library-table
--comment: Библиотека заготовок для словообразования (источник контента, не привязана к заданиям)
CREATE TABLE word_formation_library (
                                        id BIGSERIAL PRIMARY KEY,
                                        base_word VARCHAR(50) NOT NULL,          -- базовое слово (например, "HAPPY")
                                        sentence TEXT NOT NULL,                  -- предложение с пропуском, "___" отмечает место ответа
                                        correct_answer VARCHAR(100) NOT NULL,    -- ожидаемый ответ ("HAPPINESS")
                                        explanation TEXT,                        -- пояснение для ученика
                                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--rollback DROP TABLE IF EXISTS word_formation_library;