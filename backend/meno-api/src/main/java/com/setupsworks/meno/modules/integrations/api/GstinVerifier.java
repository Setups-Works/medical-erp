package com.setupsworks.meno.modules.integrations.api;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Port to a GST verification provider (INT-17). Only the GSTIN is ever sent (never personal data).
 * Callers validate the GSTIN first (GSTIN_FETCH.md §4); a failing GSTIN must never reach the provider.
 */
public interface GstinVerifier {

    /** Throws {@link GstinLookupException} for not found, rate limited or unavailable. */
    GstinDetails lookup(String gstin);

    /** Name of the active provider ("gstverify", "none"), stored as the source of fetched data. */
    String source();

    record Address(String line1, String line2, String city, String pin) {
    }

    record GstinDetails(String gstin, String legalName, String tradeName, String status, String registrationType,
            LocalDate registeredOn, LocalDate cancelledOn, String constitution, List<String> natureOfBusiness,
            boolean eInvoiceEnabled, Address address, String source, Instant fetchedAt) {
    }

    /** Why a lookup gave no details. */
    enum Failure { NOT_FOUND, RATE_LIMITED, UNAVAILABLE }

    class GstinLookupException extends RuntimeException {

        private final Failure failure;

        public GstinLookupException(Failure failure, String message) {
            super(message);
            this.failure = failure;
        }

        public Failure failure() {
            return failure;
        }
    }
}
