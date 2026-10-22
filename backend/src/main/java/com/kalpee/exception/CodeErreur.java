package com.kalpee.exception;

import org.springframework.http.HttpStatus;

public enum CodeErreur {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED),
    NOT_FOUND(HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_USED(HttpStatus.CONFLICT),
    INSUFFICIENT_BALANCE(HttpStatus.UNPROCESSABLE_ENTITY),
    OBJECTIVE_INSUFFICIENT(HttpStatus.UNPROCESSABLE_ENTITY),
    TOO_MANY_ATTEMPTS(HttpStatus.TOO_MANY_REQUESTS);

    private final HttpStatus status;

    CodeErreur(HttpStatus status) {
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
