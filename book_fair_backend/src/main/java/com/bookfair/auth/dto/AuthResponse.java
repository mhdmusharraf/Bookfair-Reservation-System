package com.bookfair.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AuthResponse {

    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    String accessToken;

    @Schema(description = "Token type", example = "Bearer")
    String tokenType = "Bearer";

    @Schema(description = "Token expiry timestamp")
    private long expiresIn;

    @Schema(description = "User details")
    UserProfileResponse user;


}

