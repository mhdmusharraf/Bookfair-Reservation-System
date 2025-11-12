package com.bookfair.common.exception;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ErrorResponse {

    LocalDateTime timestamp;

    int status;

    String error;

    String message;

    String path;
}

