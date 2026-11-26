package com.setupsworks.meno.modules.party.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.common.gst.Gstin;
import com.setupsworks.meno.modules.integrations.api.GstinVerifier;
import com.setupsworks.meno.modules.integrations.api.GstinVerifier.GstinDetails;
import com.setupsworks.meno.modules.integrations.api.GstinVerifier.GstinLookupException;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * GSTIN fetch (PTY-15, docs/product/GSTIN_FETCH.md). The four §4 checks run first: a GSTIN that fails never reaches
 * the provider. Then cache → per-tenant limit → provider. Saving a party never depends on this (manual entry).
 * The audit table arrives with the audit module; until then each lookup is logged (GSTIN is business data, not
 * personal data).
 */
@Service
public class GstinVerificationService {

    private static final Logger log = LoggerFactory.getLogger(GstinVerificationService.class);

    public record Result(String gstin, String stateCode, String pan, GstinDetails details) {
    }

    private record Cached(GstinDetails details, Instant expiresAt) {
    }

    private record Window(long startMillis, int count) {
    }

    private final GstinVerifier verifier;
    private final TenantFacade tenants;
    private final GstinLookupProperties properties;
    private final Clock clock;
    private final Map<String, Cached> cache = new ConcurrentHashMap<>();
    private final Map<UUID, Window> windows = new ConcurrentHashMap<>();

    GstinVerificationService(GstinVerifier verifier, TenantFacade tenants, GstinLookupProperties properties,
            Clock clock) {
        this.verifier = verifier;
        this.tenants = tenants;
        this.properties = properties;
        this.clock = clock;
    }

    /** §4 checks only; returns the failing check's name or null. */
    public String failedCheck(String gstin) {
        if (!Gstin.hasValidFormat(gstin)) {
            return "FORMAT";
        }
        if (!tenants.isActiveState(Gstin.stateCode(gstin))) {
            return "STATE";
        }
        if (!Gstin.hasValidPan(gstin)) {
            return "PAN";
        }
        if (!Gstin.hasValidCheckCharacter(gstin)) {
            return "CHECK_CHARACTER";
        }
        return null;
    }

    public Result verify(String rawGstin, UUID tenantId, UUID userId) {
        String gstin = rawGstin == null ? "" : rawGstin.trim().toUpperCase(java.util.Locale.ROOT);
        String failed = failedCheck(gstin);
        if (failed != null) {
            MenoException e = new MenoException(HttpStatus.UNPROCESSABLE_ENTITY, "PARTY_GSTIN_INVALID",
                    "Check the GSTIN: " + message(failed));
            e.setProperty("failedCheck", failed);
            throw e;
        }
        Instant now = clock.instant();
        Cached hit = cache.get(gstin);
        if (hit != null && hit.expiresAt().isAfter(now)) {
            audit(tenantId, userId, gstin, "CACHE");
            return new Result(gstin, Gstin.stateCode(gstin), Gstin.pan(gstin), hit.details());
        }
        countLookup(tenantId);
        try {
            GstinDetails details = verifier.lookup(gstin);
            cache.put(gstin, new Cached(details, now.plus(properties.cacheTtl())));
            audit(tenantId, userId, gstin, details.status());
            return new Result(gstin, Gstin.stateCode(gstin), Gstin.pan(gstin), details);
        } catch (GstinLookupException e) {
            audit(tenantId, userId, gstin, e.failure().name());
            throw switch (e.failure()) {
                case NOT_FOUND -> new MenoException(HttpStatus.NOT_FOUND, "PARTY_GSTIN_NOT_FOUND",
                        "The GST portal doesn't know this GSTIN.");
                case RATE_LIMITED -> rateLimited();
                case UNAVAILABLE -> new MenoException(HttpStatus.SERVICE_UNAVAILABLE, "PARTY_GSTIN_SERVICE_UNAVAILABLE",
                        "Couldn't verify now. Enter the details by hand.");
            };
        }
    }

    private void countLookup(UUID tenantId) {
        long now = clock.millis();
        Window w = windows.compute(tenantId, (k, cur) -> cur == null || now - cur.startMillis() >= 60_000
                ? new Window(now, 1) : new Window(cur.startMillis(), cur.count() + 1));
        if (w.count() > properties.lookupsPerMinutePerTenant()) {
            throw rateLimited();
        }
    }

    private static MenoException rateLimited() {
        return new MenoException(HttpStatus.TOO_MANY_REQUESTS, "PARTY_GSTIN_RATE_LIMITED",
                "Too many lookups. Try again in a minute.");
    }

    private void audit(UUID tenantId, UUID userId, String gstin, String result) {
        log.info("GSTIN lookup tenant={} user={} gstin={} source={} result={}", tenantId, userId, gstin,
                verifier.source(), result);
    }

    private static String message(String check) {
        return switch (check) {
            case "FORMAT" -> "it must be 15 characters like 33ABCDE1234F1Z5.";
            case "STATE" -> "the first two digits are not a state code.";
            case "PAN" -> "characters 3–12 must be a PAN.";
            default -> "the last character doesn't match (typing mistake?).";
        };
    }
}
