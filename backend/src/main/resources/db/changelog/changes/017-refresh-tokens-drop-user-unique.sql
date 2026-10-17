-- liquibase formatted sql

--changeset daria:017-refresh-tokens-multi-device
--comment: UNIQUE на user_id ограничивал вход одним устройством (осознанно не вводился).
-- Снимаем ограничение: у пользователя может быть несколько активных refresh-токенов.
-- Индекс idx_refresh_tokens_user_id (changeset 011) остаётся — поиск по user_id сохранён.
ALTER TABLE refresh_tokens DROP CONSTRAINT refresh_tokens_user_id_key;

--rollback ALTER TABLE refresh_tokens ADD CONSTRAINT refresh_tokens_user_id_key UNIQUE (user_id);
