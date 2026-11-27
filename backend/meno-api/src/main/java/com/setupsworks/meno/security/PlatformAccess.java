package com.setupsworks.meno.security;

import java.util.List;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Permission checks for platform (MENO staff) requests (ADR-0020). Permissions travel in the short-lived token; a
 * change reaches the staff member at their next sign-in. Tenant requests use {@link PermissionChecker} instead.
 */
@Component
public class PlatformAccess {

    /** The signed-in staff member; 401 when this is not a platform request. */
    public UUID requireUserId() {
        if (!TenantContext.isPlatform()) {
            throw new MenoException(HttpStatus.UNAUTHORIZED, "COMMON_UNAUTHENTICATED", "Please sign in.");
        }
        return TenantContext.userId().orElseThrow();
    }

    public boolean has(String permission) {
        return currentPermissions().contains(permission);
    }

    /** 403 COMMON_PERMISSION_DENIED when the staff member lacks {@code permission}. */
    public void require(String permission) {
        requireUserId();
        if (!has(permission)) {
            throw new MenoException(HttpStatus.FORBIDDEN, "COMMON_PERMISSION_DENIED",
                    "You don't have permission to do this.");
        }
    }

    public List<String> currentPermissions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt && JwtTokenService.isPlatform(jwt.getToken())) {
            List<String> perms = jwt.getToken().getClaimAsStringList(JwtTokenService.CLAIM_PERMISSIONS);
            return perms == null ? List.of() : perms.stream().sorted().toList();
        }
        return List.of();
    }
}
