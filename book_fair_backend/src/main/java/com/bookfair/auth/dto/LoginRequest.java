package com.bookfair.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @Schema(example = "info@bookco.lk")
    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @Schema(example = "StrongPassword123")
    @NotBlank(message = "Password is required")
    private String password;
}

