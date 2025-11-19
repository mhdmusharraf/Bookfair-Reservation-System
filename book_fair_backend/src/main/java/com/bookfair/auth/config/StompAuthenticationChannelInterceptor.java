package com.bookfair.auth.config;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.auth.security.JwtService;
import com.bookfair.common.util.PortalRequestUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class StompAuthenticationChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor);
            if (StringUtils.hasText(token)) {
                String username = jwtService.extractUsername(token);
                if (username != null) {
                    userRepository.findByEmail(username).ifPresent(user -> {
                        if (jwtService.isAccessTokenValid(token, user)) {
                            Authentication authentication = new UsernamePasswordAuthenticationToken(
                                    user,
                                    null,
                                    user.getAuthorities()
                            );
                            accessor.setUser(authentication);
                        }
                    });
                }
            }
        }
        return message;
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String token = extractFromAuthorizationHeader(accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION));
        if (StringUtils.hasText(token)) {
            return token;
        }

        List<String> cookieHeaders = accessor.getNativeHeader(HttpHeaders.COOKIE);
        if (cookieHeaders != null && !cookieHeaders.isEmpty()) {
            List<String> cookieNames = PortalRequestUtils.cookieNamesForAllPortals(AccessTokenHandshakeInterceptor.ACCESS_TOKEN_COOKIE);
            token = cookieHeaders.stream()
                    .flatMap(header -> Arrays.stream(header.split(";")))
                    .map(String::trim)
                    .filter(entry -> cookieNames.stream().anyMatch(name -> entry.startsWith(name + "=")))
                    .map(entry -> entry.substring(entry.indexOf('=') + 1))
                    .filter(StringUtils::hasText)
                    .findFirst()
                    .orElse(null);
            if (StringUtils.hasText(token)) {
                return token;
            }
        }

        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            token = extractFromAuthorizationHeader((String) sessionAttributes.get(AccessTokenHandshakeInterceptor.AUTHORIZATION_HEADER_ATTRIBUTE));
            if (StringUtils.hasText(token)) {
                return token;
            }
            Object cookieToken = sessionAttributes.get(AccessTokenHandshakeInterceptor.ACCESS_TOKEN_ATTRIBUTE);
            if (cookieToken instanceof String cookieTokenValue && StringUtils.hasText(cookieTokenValue)) {
                return cookieTokenValue;
            }
        }

        return null;
    }

    private String extractFromAuthorizationHeader(String authHeader) {
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
