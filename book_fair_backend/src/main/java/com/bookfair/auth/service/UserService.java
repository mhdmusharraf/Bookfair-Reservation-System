package com.bookfair.auth.service;

import com.bookfair.auth.dto.AuthResponse;
import com.bookfair.auth.dto.AuthSession;
import com.bookfair.auth.dto.LoginRequest;
import com.bookfair.auth.dto.RegisterRequest;
import com.bookfair.auth.dto.UserProfileResponse;
import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.auth.security.JwtService;
import com.bookfair.common.constants.AccountStatus;
import com.bookfair.common.constants.LoginPortal;
import com.bookfair.common.constants.Role;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final VendorAccessService vendorAccessService;

    @Transactional
    public AuthSession registerVendor(RegisterRequest request) {
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
                .status(AccountStatus.PENDING_APPROVAL)
                .build();
        user.getRoles().add(Role.VENDOR);

        userRepository.save(user);

        vendorAccessService.ensurePendingRequest(user, "system");

        return buildAuthSession(user);
    }

    @Transactional
    public AuthSession registerEmployee(RegisterRequest request) {
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
                .status(AccountStatus.ACTIVE)
                .approvedAt(LocalDateTime.now())
                .build();
        user.getRoles().add(Role.EMPLOYEE);

        userRepository.save(user);

        return buildAuthSession(user);
    }

    public AuthSession authenticate(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();
        validatePortalAccess(user, request.getPortal());
        return buildAuthSession(user);
    }

    public AuthSession refreshSession(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            throw new AccessDeniedException("Missing refresh token");
        }
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Unable to resolve refresh token subject"));
        if (!jwtService.isRefreshTokenValid(refreshToken, user)) {
            throw new AccessDeniedException("Refresh token is invalid or expired");
        }
        return buildAuthSession(user);
    }

    private void validatePortalAccess(User user, LoginPortal portal) {
        if (portal == LoginPortal.EMPLOYEE && user.getRoles().stream().noneMatch(role -> role == Role.EMPLOYEE || role == Role.ADMIN)) {
            throw new AccessDeniedException("Only employees can login to the employee portal");
        }
        if (portal == LoginPortal.VENDOR && user.getRoles().stream().noneMatch(role -> role == Role.VENDOR)) {
            throw new AccessDeniedException("Only vendors can login to the vendor portal");
        }

        if (portal == LoginPortal.VENDOR) {
            if (user.getStatus() == AccountStatus.DISABLED) {
                throw new AccessDeniedException("This vendor account is disabled");
            }
            if (user.getStatus() == AccountStatus.PENDING_APPROVAL) {
                vendorAccessService.ensurePendingRequest(user, user.getEmail());
            }
        }
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
                .status(user.getStatus())
                .approvedAt(user.getApprovedAt())
                .build();
    }

    private AuthSession buildAuthSession(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        AuthResponse response = AuthResponse.builder()
                .user(buildProfile(user))
                .expiresAt(jwtService.extractExpiration(accessToken))
                .build();
        return AuthSession.builder()
                .response(response)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenTtlSeconds(jwtService.getAccessTokenTtlSeconds())
                .refreshTokenTtlSeconds(jwtService.getRefreshTokenTtlSeconds())
                .build();
    }
}

