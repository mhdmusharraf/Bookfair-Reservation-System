package com.bookfair.common.exception;

/**
 * Thrown when a disabled account tries to log in.
 */
public class AccountDisabledException extends RuntimeException {
    public AccountDisabledException(String message) {
        super(message);
    }
}
