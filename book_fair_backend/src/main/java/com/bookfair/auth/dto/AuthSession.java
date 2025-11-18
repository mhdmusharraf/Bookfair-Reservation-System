package com.bookfair.auth.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthSession {

    AuthResponse response;
    String accessToken;
    String refreshToken;
    long accessTokenTtlSeconds;
    long refreshTokenTtlSeconds;
}
