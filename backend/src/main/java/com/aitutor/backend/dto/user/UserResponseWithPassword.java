package com.aitutor.backend.dto.user;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
public class UserResponseWithPassword extends UserResponse {
    private String password;
}