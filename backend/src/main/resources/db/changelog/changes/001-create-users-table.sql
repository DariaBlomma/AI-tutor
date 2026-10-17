-- liquibase formatted sql

--changeset daria:001-create-users-table
--comment: Таблица пользователей (аутентификация и базовые данные)
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       -- уникальность (в т.ч. case-insensitive) среди неудалённых — частичные индексы в changeset 016
                       user_name VARCHAR(200) NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       email VARCHAR(200) NOT NULL,
                       first_name VARCHAR(200),
                       last_name VARCHAR(200),
                       role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
                       teacher_code VARCHAR(50) UNIQUE, -- Код учителя для ссылки-приглашения
                       created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       deleted_at TIMESTAMP WITH TIME ZONE
);

--rollback DROP TABLE IF EXISTS users;