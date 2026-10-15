package com.aitutor.backend.security;

import com.aitutor.backend.entities.User;
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