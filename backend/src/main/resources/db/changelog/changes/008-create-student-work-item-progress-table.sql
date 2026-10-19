-- liquibase formatted sql

--changeset daria:008-create-student-work-item-progress-table
--comment: Детальный прогресс ученика по каждому слову в задании
CREATE TABLE student_work_item_progress (
                                            id BIGSERIAL PRIMARY KEY,
                                            student_work_id BIGINT NOT NULL,
                                            task_item_id BIGINT NOT NULL,
                                            status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED'
                                                CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SOLVED')),
                                            answer_attempts INT DEFAULT 0,
                                            hints_given INT DEFAULT 0,             -- Максимум 3
                                            first_try_correct BOOLEAN NOT NULL DEFAULT FALSE,
                                                                                   -- Верно с первой попытки (агрегируется в student_work при complete)
                                            student_answer VARCHAR(100),           -- Последний введенный ответ
                                            solved_at TIMESTAMP WITH TIME ZONE,

                                            CONSTRAINT fk_progress_work FOREIGN KEY (student_work_id) REFERENCES student_work(id) ON DELETE CASCADE,
                                            CONSTRAINT fk_progress_item FOREIGN KEY (task_item_id) REFERENCES task_items(id) ON DELETE RESTRICT
);

CREATE INDEX idx_progress_work ON student_work_item_progress(student_work_id);

--rollback DROP TABLE IF EXISTS student_work_item_progress;