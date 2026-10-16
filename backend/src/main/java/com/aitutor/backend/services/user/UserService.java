package com.aitutor.backend.services.user;

import com.aitutor.backend.dto.auth.SignUpRequest;
import com.aitutor.backend.dto.user.UserResponse;
import com.aitutor.backend.dto.user.UserResponseWithPassword;
import com.aitutor.backend.entities.StudentProfile;
import com.aitutor.backend.entities.User;
import com.aitutor.backend.enums.UserRole;
import com.aitutor.backend.exceptions.ConflictException;
import com.aitutor.backend.exceptions.InvalidRequestException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.helpers.TeacherCodeGenerator;
import com.aitutor.backend.mappers.UserMapper;
import com.aitutor.backend.repositories.StudentProfileRepository;
import com.aitutor.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Регистрация учителя и ученика (роль приходит из UI). Одна транзакция:
     * - TEACHER: автоматически генерируется уникальный teacherCode для ссылки-приглашения;
     * - STUDENT: обязателен teacherCode учителя — по нему ученик привязывается к учителю
     *   и сразу создаётся его student_profile (ручных правок в БД больше не нужно).
     */
    @Transactional
    public UserResponse create(SignUpRequest request) {
        if (userRepository.existsByUserNameAndDeletedAtIsNull(request.getUserName())) {
            log.warn("Попытка регистрации с существующим именем пользователя: username='{}'", request.getUserName());
            throw new ConflictException("User with such name already exists");
        }
        if (userRepository.findActiveByEmail(request.getEmail()).isPresent()) {
            log.warn("Попытка регистрации с существующим email: email='{}'", request.getEmail());
            throw new ConflictException("User with such email already exists");
        }

        // Валидируем привязку ДО создания пользователя, чтобы при ошибке не остался «сиротский» аккаунт
        User teacher = null;
        if (request.getRole() == UserRole.STUDENT) {
            teacher = resolveTeacherByCode(request.getTeacherCode());
        }

        User userForSaving = userMapper.toEntityWithoutPassword(request);
        userForSaving.setPassword(passwordEncoder.encode(request.getPassword()));

        if (request.getRole() == UserRole.TEACHER) {
            userForSaving.setTeacherCode(generateUniqueTeacherCode());
        }

        User savedUser = userRepository.save(userForSaving);

        if (request.getRole() == UserRole.STUDENT) {
            studentProfileRepository.save(StudentProfile.builder()
                    .user(savedUser)
                    .teacher(teacher)
                    .build());
            log.info("Ученик '{}' привязан к учителю id={} по коду '{}'",
                    savedUser.getUserName(), teacher.getId(), request.getTeacherCode());
        }

        log.info("Успешно создан новый пользователь: username='{}', role='{}', id={}",
                savedUser.getUserName(), savedUser.getRole(), savedUser.getId());
        return userMapper.toResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(Long userId) {
        User user = userRepository.findActiveById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User does not exist or deleted with such id " + userId)
        );
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponseWithPassword getMeWithPassword(String userName) {
        User user = userRepository.findActiveByUserName(userName)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist or deleted with username: " + userName));
        return userMapper.toResponseWithPassword(user);
    }

    private User resolveTeacherByCode(String teacherCode) {
        if (teacherCode == null || teacherCode.isBlank()) {
            throw new InvalidRequestException("Для регистрации ученика необходим код учителя (teacherCode)");
        }
        User teacher = userRepository.findByTeacherCodeIgnoreCase(teacherCode.trim())
                .orElseThrow(() -> new InvalidRequestException("Учитель с кодом '" + teacherCode.trim() + "' не найден"));
        if (teacher.getRole() != UserRole.TEACHER) {
            // теоретически невозможно (код есть только у учителей), но защищаемся на будущее
            throw new InvalidRequestException("Код учителя недействителен");
        }
        return teacher;
    }

    /** Генерация кода с повторной попыткой при коллизии (UNIQUE на teacher_code). */
    private String generateUniqueTeacherCode() {
        for (int attempt = 0; attempt < 5; attempt++) {
            String code = TeacherCodeGenerator.next();
            if (!userRepository.existsByTeacherCode(code)) {
                return code;
            }
        }
        // маловероятно, но лучше упасть явно, чем словить DataIntegrityViolation из save()
        throw new DataIntegrityViolationException("Не удалось уникально сгенерировать код учителя");
    }
}