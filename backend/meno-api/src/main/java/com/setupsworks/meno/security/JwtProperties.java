package com.setupsworks.meno.security;

import java.nio.file.Path;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Access-token settings. Env names follow infrastructure/env/*.example (MENO_JWT_*).
 * Keys are ES256 (P-256) PEM: files (VM / Docker secrets) or, where the host has no secret files
 * (Azure App Service, ADR-0018), the PEM text in an env var / Key Vault reference. Never in git (SECURITY.md).
 */
@ConfigurationProperties("meno.security.jwt")
public record JwtProperties(
        @DefaultValue("meno") String issuer,
        @DefaultValue("meno-local-1") String keyId,
        @DefaultValue("15m") Duration accessTokenTtl,
        Path privateKeyPath,
        Path publicKeyPath,
        /* PEM text instead of a file; used only when the paths are not set. */
        String privateKeyPem,
        String publicKeyPem,
        /* Local/test only: sign with a throw-away key when no key files are set. */
        @DefaultValue("false") boolean allowEphemeralKey) {
}
