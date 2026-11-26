package com.setupsworks.meno.security;

import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

import com.setupsworks.meno.common.error.MenoException;

import org.springframework.http.HttpStatus;

/**
 * The tenant of the current request (MULTI_TENANCY.md "Request context"). Set by {@link TenantContextFilter} from the
 * access token's {@code tid}, never from the body or a header. {@link TenantAwareDataSource} copies it into
 * {@code app.tenant_id} on every connection checkout, so PostgreSQL RLS sees it.
 *
 * <p>{@link #callAsSystem} is the narrow escape hatch for work that must run before a tenant is known (login by
 * email, refresh by token hash, sign-up, the first-owner bootstrap). It must wrap the call <em>outside</em> any
 * transaction, because the flag is read when the connection is taken from the pool.
 */
public final class TenantContext {

    private record Scope(UUID tenantId, UUID userId, boolean system) {
    }

    private static final ThreadLocal<Scope> CURRENT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static Optional<UUID> tenantId() {
        Scope scope = CURRENT.get();
        return scope == null ? Optional.empty() : Optional.ofNullable(scope.tenantId());
    }

    /** The signed-in user's tenant; 401 when there is none (endpoints that need a tenant call this). */
    public static UUID requireTenantId() {
        return tenantId().orElseThrow(() -> new MenoException(HttpStatus.UNAUTHORIZED, "COMMON_UNAUTHENTICATED",
                "Please sign in."));
    }

    public static Optional<UUID> userId() {
        Scope scope = CURRENT.get();
        return scope == null ? Optional.empty() : Optional.ofNullable(scope.userId());
    }

    public static boolean isSystem() {
        Scope scope = CURRENT.get();
        return scope != null && scope.system();
    }

    /** Runs {@code work} with RLS bypassed. Only for the pre-tenant cases listed in the class comment. */
    public static <T> T callAsSystem(Supplier<T> work) {
        Scope previous = CURRENT.get();
        CURRENT.set(new Scope(previous == null ? null : previous.tenantId(),
                previous == null ? null : previous.userId(), true));
        try {
            return work.get();
        } finally {
            restore(previous);
        }
    }

    public static void runAsSystem(Runnable work) {
        callAsSystem(() -> {
            work.run();
            return null;
        });
    }

    /** Runs {@code work} as a given tenant (background jobs iterate tenants explicitly, tests). */
    public static <T> T callAs(UUID tenantId, UUID userId, Supplier<T> work) {
        Scope previous = CURRENT.get();
        CURRENT.set(new Scope(tenantId, userId, false));
        try {
            return work.get();
        } finally {
            restore(previous);
        }
    }

    static void set(UUID tenantId, UUID userId) {
        CURRENT.set(new Scope(tenantId, userId, false));
    }

    static void clear() {
        CURRENT.remove();
    }

    private static void restore(Scope previous) {
        if (previous == null) {
            CURRENT.remove();
        } else {
            CURRENT.set(previous);
        }
    }
}
