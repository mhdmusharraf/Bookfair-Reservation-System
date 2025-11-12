package com.bookfair.stall.dto;

import com.bookfair.stall.entity.StallSize;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class StallResponse {

    @Schema(example = "1")
    Long id;

    @Schema(example = "A1")
    String code;

    StallSize size;

    String description;

    boolean reserved;
}

