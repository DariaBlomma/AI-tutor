package com.aitutor.backend.helpers;

import jakarta.servlet.http.HttpServletRequest;

public class JwtHelper {
    public static String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring("Bearer ".length());
    }
}