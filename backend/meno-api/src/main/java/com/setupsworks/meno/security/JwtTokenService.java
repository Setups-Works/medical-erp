package com.setupsworks.meno.security;

import java.time.Clock;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/**
 * Issues short-lived ES256 access tokens. Claims: {@code sub} = user id, {@code tid} = tenant id,
 * {@code email}, {@code roles}. The tenant for every request comes from {@code tid}, never from the client.
 */
@Service
public class JwtTokenService {

    public static final String CLAIM_TENANT = "tid";
    public static final String CLAIM_ROLES = "roles";
    public static final String CLAIM_EMAIL = "email";
    /** Present only on platform (MENO staff) tokens, value {@link #REALM_PLATFORM} (ADR-0020). */
    public static final String CLAIM_REALM = "realm";
    public static final String REALM_PLATFORM = "platform";
    /** Platform tokens carry their permissions (short-lived, few staff); tenant tokens carry roles instead. */
    public static final String CLAIM_PERMISSIONS = "perms";

    private final JwtEncoder encoder;
    private final JwtProperties properties;
    private final Clock clock;

    public JwtTokenService(JwtEncoder encoder, JwtProperties properties, Clock clock) {
        this.encoder = encoder;
        this.properties = properties;
        this.clock = clock;
    }

    public AccessToken issue(UUID userId, UUID tenantId, String email, Collection<String> roles) {
        Instant now = clock.instant();
        Instant expiresAt = now.plus(properties.accessTokenTtl());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .subject(userId.toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .id(Uuids.v7().toString())
                .claim(CLAIM_TENANT, tenantId.toString())
                .claim(CLAIM_EMAIL, email)
                .claim(CLAIM_ROLES, List.copyOf(roles))
                .build();
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.ES256).keyId(properties.keyId()).build();
        String value = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new AccessToken(value, expiresAt, properties.accessTokenTtl().toSeconds());
    }

    /**
     * A platform staff token (ADR-0020): no {@code tid} and no {@code roles}, so tenant endpoints can't use it, and
     * {@code realm=platform} so only /api/v1/platform/* accepts it. No refresh token: staff sign in again.
     */
    public AccessToken issuePlatform(UUID platformUserId, String email, Collection<String> permissions,
            java.time.Duration ttl) {
        Instant now = clock.instant();
        Instant expiresAt = now.plus(ttl);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .subject(platformUserId.toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .id(Uuids.v7().toString())
                .claim(CLAIM_REALM, REALM_PLATFORM)
                .claim(CLAIM_EMAIL, email)
                .claim(CLAIM_PERMISSIONS, List.copyOf(permissions))
                .build();
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.ES256).keyId(properties.keyId()).build();
        String value = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new AccessToken(value, expiresAt, ttl.toSeconds());
    }

    public static boolean isPlatform(org.springframework.security.oauth2.jwt.Jwt jwt) {
        return REALM_PLATFORM.equals(jwt.getClaimAsString(CLAIM_REALM));
    }

    public record AccessToken(String value, Instant expiresAt, long expiresInSeconds) {
    }
}
