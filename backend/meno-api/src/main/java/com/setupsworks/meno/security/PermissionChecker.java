package com.setupsworks.meno.security;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.setupsworks.meno.common.error.MenoException;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Checks permissions ({@code module.resource.action}), never role names (ADR-0014, ROLES_AND_DASHBOARDS.md).
 * Roles come from the token; their permissions from the seeded {@code role_permission} table. Per-tenant role
 * editing (PLT-07) will replace the global seed and this cache.
 */
@Component
public class PermissionChecker {

    private final JdbcTemplate jdbc;
    private final Map<String, Set<String>> byRole = new ConcurrentHashMap<>();

    PermissionChecker(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean has(String permission) {
        return currentRoles().stream().anyMatch(role -> permissionsOf(role).contains(permission));
    }

    /** 403 COMMON_PERMISSION_DENIED when the signed-in user lacks {@code permission}. */
    public void require(String permission) {
        if (!has(permission)) {
            throw new MenoException(HttpStatus.FORBIDDEN, "COMMON_PERMISSION_DENIED",
                    "You don't have permission to do this.");
        }
    }

    private Set<String> permissionsOf(String role) {
        return byRole.computeIfAbsent(role, r -> TenantContext.callAsSystem(() -> Set.copyOf(jdbc.queryForList(
                "select permission_code from role_permission where role = ?", String.class, r))));
    }

    private static List<String> currentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt) {
            List<String> roles = jwt.getToken().getClaimAsStringList(JwtTokenService.CLAIM_ROLES);
            return roles == null ? List.of() : roles;
        }
        return List.of();
    }

    /** For tests: forget cached role → permission sets. */
    void evictAll() {
        byRole.clear();
    }
}
