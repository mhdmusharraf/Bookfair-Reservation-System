package com.bookfair.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Singular;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class ReservationResponse {

    @Schema(example = "10")
    Long id;

    @Schema(example = "2025-05-10T12:30:00")
    LocalDateTime reservedAt;

    @Schema(example = "RES-20240510-XYZ")
    String confirmationCode;

    @Singular
    List<String> stalls;

    int totalReservedStalls;

    @Schema(example = "Acme Books")
    String vendorBusinessName;

    @Schema(example = "info@acmebooks.com")
    String vendorEmail;

    @Schema(example = "0771234567")
    String vendorContactNumber;
}

