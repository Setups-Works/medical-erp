package com.setupsworks.meno.modules.integrations.gst;

import java.net.http.HttpClient;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

import com.setupsworks.meno.modules.integrations.api.GstinVerifier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Candidate provider "GST verify API" (GSTIN_FETCH.md §2), basic details ({@code full=false}, no key).
 * Provider codes → ours: 400 → NOT_FOUND, 429 → RATE_LIMITED, anything else / timeout → UNAVAILABLE.
 */
class GstVerifyAdapter implements GstinVerifier {

    private static final Logger log = LoggerFactory.getLogger(GstVerifyAdapter.class);
    // STRICT: a malformed date such as 31/02 must not silently become 29/02.
    private static final DateTimeFormatter PORTAL_DATE = DateTimeFormatter.ofPattern("dd/MM/uuuu")
            .withResolverStyle(java.time.format.ResolverStyle.STRICT);

    private final RestClient http;
    private final Clock clock;

    GstVerifyAdapter(GstinProviderProperties properties, Clock clock) {
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(properties.timeout()).build());
        factory.setReadTimeout(properties.timeout());
        RestClient.Builder builder = RestClient.builder().baseUrl(properties.baseUrl()).requestFactory(factory);
        if (properties.apiKey() != null && !properties.apiKey().isBlank()) {
            builder.defaultHeader("X-API-Key", properties.apiKey());
        }
        this.http = builder.build();
        this.clock = clock;
    }

    @Override
    public String source() {
        return "gstverify";
    }

    @Override
    public GstinDetails lookup(String gstin) {
        ProviderResponse response;
        try {
            response = http.get()
                    .uri(u -> u.path("/api/v1/gst/details").queryParam("gstin", gstin).queryParam("full", false).build())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        throw failureFor(res.getStatusCode().value());
                    })
                    .body(ProviderResponse.class);
        } catch (GstinLookupException e) {
            throw e;
        } catch (ResourceAccessException e) {
            log.warn("GST verify timed out or unreachable: {}", e.getMessage());
            throw new GstinLookupException(Failure.UNAVAILABLE, "Provider unreachable");
        } catch (RestClientException e) {
            log.warn("GST verify returned an unreadable answer: {}", e.getMessage());
            throw new GstinLookupException(Failure.UNAVAILABLE, "Provider answer unreadable");
        }
        if (response == null || !response.success() || response.data() == null) {
            throw new GstinLookupException(Failure.NOT_FOUND, "Provider did not return details");
        }
        return map(response.data());
    }

    private static GstinLookupException failureFor(int status) {
        return switch (status) {
            case 400, 404 -> new GstinLookupException(Failure.NOT_FOUND, "Unknown GSTIN");
            case 429 -> new GstinLookupException(Failure.RATE_LIMITED, "Provider rate limit");
            default -> {
                log.warn("GST verify answered HTTP {}", status);
                yield new GstinLookupException(Failure.UNAVAILABLE, "Provider error " + status);
            }
        };
    }

    private GstinDetails map(Data d) {
        StructuredAddress a = d.structured_address();
        return new GstinDetails(d.gstin(), blankToNull(d.lgnm()), blankToNull(d.tradeNam()), status(d.sts()),
                registrationType(d.dty()), date(d.rgdt()), date(d.cxdt()), blankToNull(d.ctb()),
                d.nba() == null ? List.of() : List.copyOf(d.nba()), "yes".equalsIgnoreCase(d.einvoiceStatus()),
                a == null ? null : new Address(blankToNull(a.address_line1()), blankToNull(a.address_line2()),
                        blankToNull(a.city()), blankToNull(a.pincode())),
                source(), clock.instant());
    }

    /** "Active" / "Cancelled" / "Suspended" → ACTIVE / CANCELLED / SUSPENDED; anything else UNKNOWN. */
    static String status(String sts) {
        if (sts == null) {
            return "UNKNOWN";
        }
        String s = sts.trim().toUpperCase(Locale.ROOT);
        if (s.startsWith("ACTIVE")) {
            return "ACTIVE";
        }
        if (s.startsWith("CANCEL")) {
            return "CANCELLED";
        }
        if (s.startsWith("SUSPEND")) {
            return "SUSPENDED";
        }
        return "UNKNOWN";
    }

    /** Portal "dty" ("Regular", "Composition", "SEZ Unit"…) → upper snake case, matched later to the config list. */
    static String registrationType(String dty) {
        return dty == null || dty.isBlank() ? null
                : dty.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "_").replaceAll("(^_|_$)", "");
    }

    static LocalDate date(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim(), PORTAL_DATE);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    // Provider JSON (field names as the provider sends them).
    record ProviderResponse(boolean success, Data data) {
    }

    record Data(String gstin, String lgnm, String tradeNam, String sts, String rgdt, String ctb, String dty,
            String cxdt, String einvoiceStatus, List<String> nba, StructuredAddress structured_address) {
    }

    record StructuredAddress(String address_line1, String address_line2, String city, String state, String pincode) {
    }
}
