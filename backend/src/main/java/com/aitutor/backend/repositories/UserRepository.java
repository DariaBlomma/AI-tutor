package com.aitutor.backend.repositories;

import com.aitutor.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.id = :id AND u.deletedAt IS NULL")
    Optional<User> findActiveById(@Param("id") Long id);

    @Query("SELECT u FROM User u WHERE LOWER(u.userName) = LOWER(:userName) AND u.deletedAt IS NULL")
    Optional<User> findActiveByUserName(@Param("userName") String userName);

    /**
     * Email хранится в нижнем регистре (нормализация при регистрации); сравнение через LOWER —
     * на всякий случай для legacy-строк. Частичный индекс uq_users_email_active — только среди неудалённых.
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.deletedAt IS NULL")
    Optional<User> findActiveByEmail(@Param("email") String email);

    /** Case-insensitive проверка уникальности username среди неудалённых — согласована с uq_users_user_name_active. */
    boolean existsByUserNameIgnoreCaseAndDeletedAtIsNull(String userName);

    /** Поиск учителя по коду приглашения (без учёта регистра), только активные пользователи. */
    @Query("SELECT u FROM User u WHERE LOWER(u.teacherCode) = LOWER(:code) AND u.deletedAt IS NULL")
    Optional<User> findByTeacherCodeIgnoreCase(@Param("code") String code);

    boolean existsByTeacherCode(String teacherCode);
}