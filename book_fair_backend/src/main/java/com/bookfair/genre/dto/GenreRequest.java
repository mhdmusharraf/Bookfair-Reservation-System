package com.bookfair.genre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenreRequest {

    @Schema(example = "Science Fiction")
    @NotBlank(message = "Genre name is required")
    private String name;
}

