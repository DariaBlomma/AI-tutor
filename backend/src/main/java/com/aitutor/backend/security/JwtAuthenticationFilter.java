package com.aitutor.backend.security;

import com.aitutor.backend.enums.UserRole;
import com.aitutor.backend.helpers.JwtHelper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final AccessTokenService accessTokenService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String jwtToken = JwtHelper.extractTokenFromHeader(request);

        if (jwtToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = accessTokenService.extractUserName(jwtToken);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Роль и id берём только из claims токена — SELECT к БД на каждый запрос не делается.
            // Токены без claim "role" считаются невалидными: обратной совместимости нет,
            // все access-токены выдаются с ролью.
            try {
                if (accessTokenService.isValidToken(jwtToken, username)) {
                    UserRole tokenRole = accessTokenService.extractRole(jwtToken);
                    Long tokenUserId = accessTokenService.extractUserId(jwtToken);

                    if (tokenRole == null || tokenUserId == null) {
                        log.debug("Access-токен без claims role/userId для пользователя '{}' — запрос оставлен анонимным",
                                username);
                    } else {
                        CustomUserDetails userDetails = new CustomUserDetails(tokenUserId, username, tokenRole);

                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (ExpiredJwtException e) {
                log.debug("Получен просроченный access-токен от '{}' (URI: {}): {}",
                        username, request.getRequestURI(), e.getMessage());
            } catch (JwtException | IllegalArgumentException e) {
                log.debug("Невалидный/повреждённый access-токен от '{}' (URI: {}): {}",
                        username, request.getRequestURI(), e.getMessage());
            } catch (Exception e) {
                log.warn("Непредвиденная ошибка при проверке access-токена от '{}' (URI: {})",
                        username, request.getRequestURI(), e);
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/");
    }
}