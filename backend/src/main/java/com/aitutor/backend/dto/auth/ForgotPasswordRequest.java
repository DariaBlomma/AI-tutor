package com.aitutor.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ForgotPasswordRequest {
    @NotBlank(message = "User email is required")
    @Email(message = "Invalid email format")
    private String email;
}
