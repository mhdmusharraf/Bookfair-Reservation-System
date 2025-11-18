package com.bookfair.auth.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Arrays;
import java.util.Map;

@Component
public class AccessTokenHandshakeInterceptor implements HandshakeInterceptor {

    public static final String AUTHORIZATION_HEADER_ATTRIBUTE = "stompAuthorizationHeader";
    public static final String ACCESS_TOKEN_ATTRIBUTE = "stompAccessToken";
    public static final String ACCESS_TOKEN_COOKIE = "access_token";

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String authorizationHeader = httpRequest.getHeader(HttpHeaders.AUTHORIZATION);
            if (StringUtils.hasText(authorizationHeader)) {
                attributes.put(AUTHORIZATION_HEADER_ATTRIBUTE, authorizationHeader);
            }
            Cookie[] cookies = httpRequest.getCookies();
            if (cookies != null) {
                Arrays.stream(cookies)
                        .filter(cookie -> ACCESS_TOKEN_COOKIE.equals(cookie.getName()))
                        .map(Cookie::getValue)
                        .filter(StringUtils::hasText)
                        .findFirst()
                        .ifPresent(token -> attributes.put(ACCESS_TOKEN_ATTRIBUTE, token));
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // no-op
    }
}
