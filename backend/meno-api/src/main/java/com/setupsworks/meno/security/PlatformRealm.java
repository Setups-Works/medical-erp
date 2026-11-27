package com.setupsworks.meno.security;

import java.util.function.Supplier;

import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationResult;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;

/**
 * Keeps the two realms apart (ADR-0020): a platform (MENO staff) token is accepted only under /api/v1/platform/**,
 * and a tenant token never is. Unauthenticated requests get 401 from both, as before.
 */
final class PlatformRealm {

    static final AuthorizationManager<RequestAuthorizationContext> PLATFORM_ONLY = (auth, ctx) -> decide(auth, true);
    static final AuthorizationManager<RequestAuthorizationContext> TENANT_ONLY = (auth, ctx) -> decide(auth, false);

    private PlatformRealm() {
    }

    private static AuthorizationResult decide(Supplier<? extends Authentication> supplier, boolean platform) {
        Authentication auth = supplier.get();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return new AuthorizationDecision(false);
        }
        boolean isPlatform = auth instanceof JwtAuthenticationToken jwt && JwtTokenService.isPlatform(jwt.getToken());
        return new AuthorizationDecision(isPlatform == platform);
    }
}
