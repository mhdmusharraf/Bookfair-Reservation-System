package com.bookfair.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @Schema(example = "The Book Company")
    @NotBlank(message = "Business name is required")
    private String businessName;

    @Schema(example = "0112345678")
    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9+\-]{7,15}$", message = "Invalid contact number")
    private String contactNumber;

    @Schema(example = "info@bookco.lk")
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Schema(example = "StrongPassword123")
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must contain at least 8 characters")
    private String password;
}

