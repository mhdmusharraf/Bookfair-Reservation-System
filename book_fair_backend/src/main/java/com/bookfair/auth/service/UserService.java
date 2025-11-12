package com.bookfair.auth.service;

import com.bookfair.auth.dto.AuthResponse;
import com.bookfair.auth.dto.LoginRequest;
import com.bookfair.auth.dto.RegisterRequest;
import com.bookfair.auth.dto.UserProfileResponse;
import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.auth.security.JwtService;
import com.bookfair.common.constants.Role;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse registerVendor(RegisterRequest request) {
        log.info("Registering new vendor with email {}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .businessName(request.getBusinessName())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();
        user.getRoles().add(Role.VENDOR);

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse registerEmployee(RegisterRequest request) {
        log.info("Registering new employee with email {}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .businessName(request.getBusinessName())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdAt(LocalDateTime.now())
                .build();
        user.getRoles().add(Role.EMPLOYEE);

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse authenticate(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();
        return buildAuthResponse(user);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalStateException("Unable to locate authenticated user");
        }
        return user;
    }

    public UserProfileResponse buildProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .businessName(user.getBusinessName())
                .contactNumber(user.getContactNumber())
                .email(user.getEmail())
                .roles(user.getRoles())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .expiresAt(jwtService.extractExpiration(token))
                .build();
    }
}

