package com.bookfair.auth.dto;

import com.bookfair.common.constants.LoginPortal;
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
    LoginPortal portal;
}
