package com.aitutor.backend.security;

import com.aitutor.backend.configs.JwtProperties;
import com.aitutor.backend.enums.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.security.Key;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class AccessTokenService {
    private final JwtProperties jwtProperties;

    public String generateToken(String userName, Long userId, String email, UserRole role, Instant expiresAt) {
        Map<String, Object> claims = new HashMap<>();
        if (userId != null) {
            claims.put("userId", userId);
        }
        if (email != null) {
            claims.put("email", email);
        }
        if (role != null) {
            claims.put("role", role.name());
        }
        return createToken(claims, userName, expiresAt);
    }

    public boolean isValidToken(String token, String userName) {
        try {
            String extractedUserName = extractUserName(token);
            return (extractedUserName.equals(userName)) && !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    /**
     * Роль из обязательного claim "role". Возвращает null только если роль отсутствует
     * или содержит неизвестное значение — вызывающий код обязан отклонить такой токен
     * (все access-токены выдаются с ролью, обратной совместимости нет).
     */
    public UserRole extractRole(String token) {
        String role = extractClaim(token, claims -> claims.get("role", String.class));
        if (role == null) {
            return null;
        }
        try {
            return UserRole.valueOf(role);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Момент истечения access-токена по текущей конфигурации (длительность из jwt.token.expiration).
     */
    public Instant calculateExpiresAt() {
        return Instant.now().plus(jwtProperties.getExpiration());
    }

    private String createToken(Map<String, Object> claims, String subject, Instant expiresAt) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(expiresAt))
                .signWith(getSignKey())
                .compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        return expiration.toInstant().isBefore(Instant.now());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
