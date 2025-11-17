package com.bookfair.auth.config;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StompAuthenticationChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtService.extractUsername(token);
                if (username != null) {
                    userRepository.findByEmail(username).ifPresent(user -> {
                        if (jwtService.isTokenValid(token, user)) {
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
}
