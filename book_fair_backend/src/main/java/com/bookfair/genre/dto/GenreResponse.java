package com.bookfair.genre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class GenreResponse {

    @Schema(example = "1")
    Long id;

    @Schema(example = "Science Fiction")
    String name;
}

