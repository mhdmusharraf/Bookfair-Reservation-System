package com.bookfair.stall.dto;

import com.bookfair.stall.entity.StallSize;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StallRequest {

    @Schema(example = "A1")
    @NotBlank(message = "Stall code is required")
    private String code;

    @Schema(example = "SMALL")
    @NotNull(message = "Stall size is required")
    private StallSize size;

    @Schema(example = "Near the main entrance")
    private String description;
}

