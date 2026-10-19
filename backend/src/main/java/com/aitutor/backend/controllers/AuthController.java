package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.auth.*;
import com.aitutor.backend.helpers.JwtHelper;
import com.aitutor.backend.security.AccessTokenService;
import com.aitutor.backend.services.auth.AuthService;
import com.aitutor.backend.exceptions.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final AccessTokenService accessTokenService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signUp(@Valid @RequestBody SignUpRequest request) {
        return authService.signUp(request);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    @ResponseStatus(HttpStatus.OK)
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.OK)
    public void logout(HttpServletRequest request, @Valid @RequestBody RefreshTokenRequest body) {
        String jwtToken = JwtHelper.extractTokenFromHeader(request);

        if (jwtToken == null) {
            throw new UnauthorizedException("Access token is required for logout");
        }
        Long userId = accessTokenService.extractUserId(jwtToken);
        if (userId == null) {
            throw new UnauthorizedException("Invalid access token");
        }
        // Отзывается именно предъявленный refresh-токен этого пользователя,
        // а не все его сессии — остальные устройства остаются в системе.
        authService.logout(body.refreshToken(), userId);
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.OK)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.handleForgotPassword(request);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.OK)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }
}
