package com.bookfair.auth.controller;

import com.bookfair.auth.dto.AuthResponse;
import com.bookfair.auth.dto.LoginRequest;
import com.bookfair.auth.dto.RegisterRequest;
import com.bookfair.auth.dto.UserProfileResponse;
import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Authentication")
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register a new vendor account")
    public ResponseEntity<AuthResponse> registerVendor(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerVendor(request));
    }

    @PostMapping("/register/employee")
    @Operation(summary = "Register a new employee account")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> registerEmployee(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerEmployee(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate and retrieve a JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.authenticate(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Retrieve the profile of the authenticated user")
    public ResponseEntity<UserProfileResponse> me() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(userService.buildProfile(user));
    }
}

