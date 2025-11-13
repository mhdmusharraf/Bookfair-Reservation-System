package com.bookfair.auth.controller;

import com.bookfair.auth.dto.AuthRequest;
import com.bookfair.auth.dto.RegisterRequest;
import com.bookfair.auth.dto.AuthResponse;
import com.bookfair.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication Controller responsible for user registration and login.
 */
@Slf4j
@RestController
@RequestMapping(value = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for vendor registration and login (JWT-based)")
public class AuthController {

    private final AuthService authService;

    /**
     * Vendor Registration Endpoint.
     *
     * @param request RegisterRequest containing email, password, business info.
     * @return AuthResponse with JWT token and user profile data.
     */
    @Operation(
            summary = "Register a new Vendor",
            description = "Registers a new vendor account and returns a JWT token with vendor profile.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Vendor registered successfully",
                            content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                    @ApiResponse(responseCode = "409", description = "Email already registered"),
                    @ApiResponse(responseCode = "400", description = "Validation error")
            }
    )
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuthResponse> registerVendor(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        AuthResponse response = authService.registerVendor(request);
        log.info("Vendor registered successfully: {}", request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login Endpoint for both vendors and employees.
     *
     * @param request LoginRequest containing email and password.
     * @return AuthResponse with JWT token and user profile.
     */
    @Operation(
            summary = "User Login (Vendor or Employee)",
            description = "Authenticates a user and returns a JWT token with profile details.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Login successful",
                            content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                    @ApiResponse(responseCode = "401", description = "Invalid email or password"),
                    @ApiResponse(responseCode = "403", description = "Account disabled")
            }
    )
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        log.info("Login successful for: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Refresh Token Endpoint (Future Feature).
     * Placeholder for token refresh strategy.
     */
    @Operation(
            summary = "Refresh JWT Token",
            description = "Provides a new access token using a valid refresh token (not implemented yet).",
            responses = {
                    @ApiResponse(responseCode = "501", description = "Not implemented")
            }
    )
    @PostMapping(value = "/refresh", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> refreshToken() {
        log.info("Refresh token endpoint called - not implemented");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(Map.of("message", "Refresh token endpoint not implemented yet"));
    }

    /**
     * Simple health check endpoint to verify auth service availability.
     */
    @Operation(
            summary = "Health Check",
            description = "Verifies that the Auth service is up and running.",
            responses = @ApiResponse(responseCode = "200", description = "Service healthy")
    )
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        log.debug("Auth service health check requested");
        return ResponseEntity.ok("Auth service is running");
    }
}
