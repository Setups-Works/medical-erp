package com.setupsworks.meno.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
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
 * Roles come from the token; what a role may do comes from the tenant's own list when it has one
 * ({@code role_override}) and from MENO's defaults otherwise (PLT-07, V202611271600).
 *
 * <p>Answers are cached per tenant and role for {@link #TTL}: identity evicts the tenant on this instance when roles
 * change, and other instances catch up within the TTL.
 */
@Component
public class PermissionChecker {

    static final Duration TTL = Duration.ofSeconds(30);

    /**
     * The tenant's list when an override exists (the subquery returns the tenant id), the defaults otherwise (the
     * subquery returns null and {@code is not distinct from null} matches tenant_id null).
     */
    private static final String EFFECTIVE = """
            select rp.permission_code from role_permission rp
             where rp.role = ? and rp.tenant_id is not distinct from
                   (select o.tenant_id from role_override o where o.tenant_id = ? and o.role = ?)""";

    private record Key(UUID tenantId, String role) {
    }

    private record Entry(Set<String> permissions, Instant loadedAt) {
    }

    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final Map<Key, Entry> cache = new ConcurrentHashMap<>();

    PermissionChecker(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    public boolean has(String permission) {
        UUID tenantId = TenantContext.tenantId().orElse(null);
        return currentRoles().stream().anyMatch(role -> permissionsOf(tenantId, role).contains(permission));
    }

    /** Everything the signed-in user may do (union over their roles), sorted; the UI hides what isn't here. */
    public List<String> currentPermissions() {
        UUID tenantId = TenantContext.tenantId().orElse(null);
        return currentRoles().stream().flatMap(role -> permissionsOf(tenantId, role).stream()).distinct().sorted()
                .toList();
    }

    /** 403 COMMON_PERMISSION_DENIED when the signed-in user lacks {@code permission}. */
    public void require(String permission) {
        if (!has(permission)) {
            throw new MenoException(HttpStatus.FORBIDDEN, "COMMON_PERMISSION_DENIED",
                    "You don't have permission to do this.");
        }
    }

    /** Forget a tenant's answers on this instance (identity calls this after a role or permission change commits). */
    public void evictTenant(UUID tenantId) {
        cache.keySet().removeIf(k -> tenantId.equals(k.tenantId()));
    }

    private Set<String> permissionsOf(UUID tenantId, String role) {
        Key key = new Key(tenantId, role);
        Instant now = clock.instant();
        Entry entry = cache.get(key);
        if (entry == null || entry.loadedAt().plus(TTL).isBefore(now)) {
            // Runs on the caller's connection: under RLS it sees the defaults and this tenant's rows only.
            entry = new Entry(Set.copyOf(jdbc.queryForList(EFFECTIVE, String.class, role, tenantId, role)), now);
            cache.put(key, entry);
        }
        return entry.permissions();
    }

    private static List<String> currentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt) {
            List<String> roles = jwt.getToken().getClaimAsStringList(JwtTokenService.CLAIM_ROLES);
            return roles == null ? List.of() : roles;
        }
        return List.of();
    }

    /** For tests: forget every cached answer. */
    void evictAll() {
        cache.clear();
    }
}
