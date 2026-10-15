package com.aitutor.backend.controllers;

import com.aitutor.backend.dto.user.UserResponse;
import com.aitutor.backend.security.CustomUserDetails;
import com.aitutor.backend.services.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return userService.getMe(userDetails.getId());
    }
}