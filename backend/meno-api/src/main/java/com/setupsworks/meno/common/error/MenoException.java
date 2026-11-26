package com.setupsworks.meno.common.error;

import org.springframework.http.HttpStatus;

/**
 * Business error returned to the client as RFC 9457 Problem Details.
 * {@code code} is the stable {@code MODULE_REASON} value listed in the module's AGENTS.md,
 * e.g. {@code AUTH_INVALID_CREDENTIALS}. The message must be safe to show to the user.
 */
public class MenoException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public MenoException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus status() {
        return status;
    }

    public String code() {
        return code;
    }
}
