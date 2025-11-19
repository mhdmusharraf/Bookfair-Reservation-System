package com.bookfair.auth.controller;

import com.bookfair.auth.dto.AuthResponse;
import com.bookfair.auth.dto.AuthSession;
import com.bookfair.auth.dto.LoginRequest;
import com.bookfair.auth.dto.RegisterRequest;
import com.bookfair.auth.dto.UserProfileResponse;
import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.common.constants.LoginPortal;
import com.bookfair.common.util.PortalRequestUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Authentication")
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String ACCESS_TOKEN_COOKIE = "access_token";
    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    private final UserService userService;

    @Value("${security.jwt.cookie-domain:}")
    private String cookieDomain;

    @Value("${security.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${security.jwt.cookie-same-site:Lax}")
    private String cookieSameSite;

    @PostMapping("/register")
    @Operation(summary = "Register a new vendor account")
    public ResponseEntity<AuthResponse> registerVendor(@Valid @RequestBody RegisterRequest request,
                                                       HttpServletResponse response) {
        AuthSession session = userService.registerVendor(request);
        return respondWithSession(session, response);
    }

    @PostMapping("/register/employee")
    @Operation(summary = "Register a new employee account")
//    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> registerEmployee(@Valid @RequestBody RegisterRequest request,
                                                         HttpServletResponse response) {
        AuthSession session = userService.registerEmployee(request);
        return respondWithSession(session, response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate and establish a session")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        AuthSession session = userService.authenticate(request);
        return respondWithSession(session, response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using a valid refresh cookie")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        LoginPortal portal = PortalRequestUtils.resolvePortal(request)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Portal header is required"));
        String refreshToken = readCookie(request, PortalRequestUtils.cookieName(REFRESH_TOKEN_COOKIE, portal))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token missing"));
        AuthSession session = userService.refreshSession(refreshToken, portal);
        return respondWithSession(session, response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Clear authentication cookies")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        LoginPortal portal = PortalRequestUtils.resolvePortal(request).orElse(null);
        clearAuthCookies(response, portal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Retrieve the profile of the authenticated user")
    public ResponseEntity<UserProfileResponse> me() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(userService.buildProfile(user));
    }

    private ResponseEntity<AuthResponse> respondWithSession(AuthSession session, HttpServletResponse response) {
        addAuthCookies(response, session);
        return ResponseEntity.ok(session.getResponse());
    }

    private void addAuthCookies(HttpServletResponse response, AuthSession session) {
        LoginPortal portal = session.getPortal();
        writeCookie(response,
                PortalRequestUtils.cookieName(ACCESS_TOKEN_COOKIE, portal),
                session.getAccessToken(),
                session.getAccessTokenTtlSeconds());
        writeCookie(response,
                PortalRequestUtils.cookieName(REFRESH_TOKEN_COOKIE, portal),
                session.getRefreshToken(),
                session.getRefreshTokenTtlSeconds());
    }

    private void clearAuthCookies(HttpServletResponse response, LoginPortal portal) {
        if (portal != null) {
            expireCookie(response, PortalRequestUtils.cookieName(ACCESS_TOKEN_COOKIE, portal));
            expireCookie(response, PortalRequestUtils.cookieName(REFRESH_TOKEN_COOKIE, portal));
            return;
        }
        PortalRequestUtils.cookieNamesForAllPortals(ACCESS_TOKEN_COOKIE)
                .forEach(name -> expireCookie(response, name));
        PortalRequestUtils.cookieNamesForAllPortals(REFRESH_TOKEN_COOKIE)
                .forEach(name -> expireCookie(response, name));
    }

    private void writeCookie(HttpServletResponse response, String name, String value, long maxAgeSeconds) {
        ResponseCookie cookie = baseCookie(name)
                .value(value)
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void expireCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = baseCookie(name)
                .value("")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String name) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/");
        if (StringUtils.hasText(cookieSameSite)) {
            builder.sameSite(cookieSameSite);
        }
        if (StringUtils.hasText(cookieDomain)) {
            builder.domain(cookieDomain);
        }
        return builder;
    }

    private Optional<String> readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}

