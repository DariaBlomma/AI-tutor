-- liquibase formatted sql

--changeset daria:002-create-student-profiles-table
--comment: Профили учеников (привязка к учителю, класс)
CREATE TABLE student_profiles (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id BIGINT NOT NULL UNIQUE,      -- Ссылка на users (1 к 1)
                                  teacher_id BIGINT NOT NULL,          -- ID учителя (ссылка на users)
                                  class VARCHAR(50),                   -- Класс ученика
                                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                                  CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_student_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_student_profiles_teacher ON student_profiles(teacher_id);

--rollback DROP TABLE IF EXISTS student_profiles;