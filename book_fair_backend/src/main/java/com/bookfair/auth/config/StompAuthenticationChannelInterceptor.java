package com.bookfair.auth.config;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.auth.security.JwtService;
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

@Component
@RequiredArgsConstructor
public class StompAuthenticationChannelInterceptor implements ChannelInterceptor {

    private static final String ACCESS_TOKEN_COOKIE = "access_token";

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
        String authHeader = accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        List<String> cookieHeaders = accessor.getNativeHeader(HttpHeaders.COOKIE);
        if (cookieHeaders == null || cookieHeaders.isEmpty()) {
            return null;
        }
        return cookieHeaders.stream()
                .flatMap(header -> Arrays.stream(header.split(";")))
                .map(String::trim)
                .filter(entry -> entry.startsWith(ACCESS_TOKEN_COOKIE + "="))
                .map(entry -> entry.substring((ACCESS_TOKEN_COOKIE + "=").length()))
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse(null);
    }
}
