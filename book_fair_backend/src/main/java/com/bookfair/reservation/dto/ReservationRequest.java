package com.bookfair.reservation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ReservationRequest {

    @Schema(description = "IDs of the stalls to reserve", example = "[1,2]")
    @NotEmpty(message = "At least one stall must be selected")
    private List<Long> stallIds;
}

