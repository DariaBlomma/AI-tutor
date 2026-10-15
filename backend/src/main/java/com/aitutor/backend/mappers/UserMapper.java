package com.aitutor.backend.mappers;

import com.aitutor.backend.dto.auth.SignUpRequest;
import com.aitutor.backend.dto.user.UserResponse;
import com.aitutor.backend.dto.user.UserResponseWithPassword;
import com.aitutor.backend.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "password", ignore = true)
    User toEntityWithoutPassword(SignUpRequest request);

    UserResponse toResponse(User user);

    UserResponseWithPassword toResponseWithPassword(User user);

    UserResponse fromWithPasswordToResponse(UserResponseWithPassword user);
}