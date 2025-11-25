package com.bookfair.auth.service;

import com.bookfair.auth.dto.AuthResponse;
import com.bookfair.auth.dto.AuthSession;
import com.bookfair.auth.dto.LoginRequest;
import com.bookfair.auth.dto.RegisterRequest;
import com.bookfair.auth.dto.UserProfileResponse;
import com.bookfair.auth.entity.User;
import com.bookfair.auth.entity.RefreshToken;
import com.bookfair.auth.repository.RefreshTokenRepository;
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
    private final RefreshTokenRepository refreshTokenRepository;
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

        return buildAuthSession(user, LoginPortal.VENDOR);
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

        return buildAuthSession(user, LoginPortal.EMPLOYEE);
    }

    public AuthSession authenticate(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();
        validatePortalAccess(user, request.getPortal());
        return buildAuthSession(user, request.getPortal());
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

    private AuthSession buildAuthSession(User user, LoginPortal portal) {
        String accessToken = jwtService.generateAccessToken(user, portal);
        String refreshToken = createAndPersistRefreshToken(user, portal);
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
                .portal(portal)
                .build();
    }

    @Transactional
    public AuthSession refreshSession(String refreshToken, LoginPortal portal) {
        if (!StringUtils.hasText(refreshToken)) {
            throw new AccessDeniedException("Missing refresh token");
        }

        // 1. Look up the refresh token record so we can enforce revocation and expiry independent of the access token
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AccessDeniedException("Refresh token is not recognized"));

        // 2. Ensure the token has not been manually revoked or expired in the database
        if (storedToken.isRevoked() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AccessDeniedException("Refresh token is invalid or expired");
        }

        User user = storedToken.getUser();
        validatePortalAccess(user, storedToken.getPortal());
        if (portal != null && portal != storedToken.getPortal()) {
            throw new AccessDeniedException("Refresh token does not match the requested portal");
        }

        // 3. Validate the refresh token's signature and claims without relying on the access token
        if (!jwtService.isRefreshTokenValidForPortal(refreshToken, user, storedToken.getPortal())) {
            throw new AccessDeniedException("Refresh token signature is invalid");
        }

        // 4. Rotate the refresh token to prevent reuse attacks before issuing a new pair of tokens
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // 5. Generate brand new tokens and persist the rotated refresh token
        String newRefreshToken = createAndPersistRefreshToken(user, storedToken.getPortal());
        String accessToken = jwtService.generateAccessToken(user, storedToken.getPortal());

        AuthResponse response = AuthResponse.builder()
                .user(buildProfile(user))
                .expiresAt(jwtService.extractExpiration(accessToken))
                .build();

        return AuthSession.builder()
                .response(response)
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .accessTokenTtlSeconds(jwtService.getAccessTokenTtlSeconds())
                .refreshTokenTtlSeconds(jwtService.getRefreshTokenTtlSeconds())
                .portal(storedToken.getPortal())
                .build();
    }

    private String createAndPersistRefreshToken(User user, LoginPortal portal) {
        // Clean up any already expired tokens for the user to keep the table small
        refreshTokenRepository.deleteByUserAndExpiresAtBefore(user, LocalDateTime.now());

        // Build a new signed refresh token that carries only refresh claims
        String refreshToken = jwtService.generateRefreshToken(user, portal);
        RefreshToken tokenRecord = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .portal(portal)
                .expiresAt(jwtService.extractExpiration(refreshToken))
                .revoked(false)
                .build();
        refreshTokenRepository.save(tokenRecord);
        return refreshToken;
    }
}

