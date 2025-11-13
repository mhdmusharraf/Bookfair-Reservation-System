package com.bookfair.common.exception;

/**
 * Thrown when a registration attempt is made with an already existing email.
 */
public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
