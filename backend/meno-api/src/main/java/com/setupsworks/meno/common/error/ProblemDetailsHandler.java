package com.setupsworks.meno.common.error;

import java.net.URI;
import java.util.Locale;

import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Turns {@link MenoException} into Problem Details (docs/api/API_GUIDELINES.md).
 * Spring's base class already renders validation and framework errors as Problem Details.
 */
@RestControllerAdvice
class ProblemDetailsHandler extends ResponseEntityExceptionHandler {

    private static final String TYPE_BASE = "https://meno.app/problems/";

    @ExceptionHandler(MenoException.class)
    ResponseEntity<ProblemDetail> handleMenoException(MenoException ex) {
        ProblemDetail body = ProblemDetail.forStatusAndDetail(ex.status(), ex.getMessage());
        body.setType(typeFor(ex.code()));
        body.setTitle(ex.status().getReasonPhrase());
        body.setProperty("code", ex.code());
        ex.properties().forEach(body::setProperty);
        return ResponseEntity.status(ex.status()).body(body);
    }

    /** {@code AUTH_INVALID_CREDENTIALS} → {@code https://meno.app/problems/auth-invalid-credentials}. */
    static URI typeFor(String code) {
        return URI.create(TYPE_BASE + code.toLowerCase(Locale.ROOT).replace('_', '-'));
    }
}
