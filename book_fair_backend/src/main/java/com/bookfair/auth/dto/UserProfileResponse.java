package com.bookfair.auth.dto;

import com.bookfair.common.constants.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.Set;

@Value
@Builder
public class UserProfileResponse {

    @Schema(example = "1")
    Long id;

    @Schema(example = "The Book Company")
    String businessName;

    @Schema(example = "0112345678")
    String contactNumber;

    @Schema(example = "info@bookco.lk")
    String email;

    Set<Role> roles;

    LocalDateTime createdAt;
}

