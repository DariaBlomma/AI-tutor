package com.aitutor.backend.security;

import com.aitutor.backend.entities.User;
import com.aitutor.backend.enums.UserRole;
import lombok.Getter;
import lombok.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    @Getter
    private final Long id;
    private final String username;
    private final String password;

    private final GrantedAuthority authority;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.username = user.getUserName();
        this.password = user.getPassword();

        // Добавляем префикс ROLE_, чтобы в SecurityConfig работал метод .hasRole("TEACHER")
        this.authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
    }

    /**
     * Лёгкий вариант без обращения к БД: id и роль берутся из claims "userId"/"role"
     * access-токена. password не заполняется (нужен только при проверке учёных данных,
     * которая идёт через AuthService напрямую по username).
     */
    public CustomUserDetails(Long id, String username, UserRole role) {
        this.id = id;
        this.username = username;
        this.password = null;
        this.authority = new SimpleGrantedAuthority("ROLE_" + role.name());
    }

    @Override
    public @NonNull Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(authority);
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public @NonNull String getUsername() {
        return username;
    }
}