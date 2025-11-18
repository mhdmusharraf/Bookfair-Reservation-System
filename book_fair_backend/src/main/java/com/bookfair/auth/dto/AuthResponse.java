package com.bookfair.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AuthResponse {

    @Schema(description = "Authenticated user profile")
    UserProfileResponse user;

    @Schema(description = "Access token expiry timestamp")
    LocalDateTime expiresAt;
}

