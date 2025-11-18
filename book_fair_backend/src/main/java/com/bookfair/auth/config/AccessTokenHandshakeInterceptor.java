package com.bookfair.auth.config;

import com.bookfair.common.constants.LoginPortal;
import com.bookfair.common.util.PortalRequestUtils;
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
import java.util.List;
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
                LoginPortal portal = PortalRequestUtils.resolvePortal(httpRequest).orElse(null);
                String cookieName = portal != null
                        ? PortalRequestUtils.cookieName(ACCESS_TOKEN_COOKIE, portal)
                        : null;
                List<String> candidates = cookieName != null
                        ? List.of(cookieName)
                        : PortalRequestUtils.cookieNamesForAllPortals(ACCESS_TOKEN_COOKIE);
                Arrays.stream(cookies)
                        .filter(cookie -> candidates.contains(cookie.getName()))
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
