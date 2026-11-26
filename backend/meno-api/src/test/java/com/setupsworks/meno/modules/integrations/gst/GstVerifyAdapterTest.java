package com.setupsworks.meno.modules.integrations.gst;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;

import com.setupsworks.meno.modules.integrations.api.GstinVerifier.Failure;
import com.setupsworks.meno.modules.integrations.api.GstinVerifier.GstinLookupException;
import com.sun.net.httpserver.HttpServer;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Recorded-shape responses from a local stub server; no live provider calls in CI (GSTIN_FETCH.md §7). */
class GstVerifyAdapterTest {

    private static final String GSTIN = "33ABCDE1234F1Z7";
    private static final String OK_BODY = """
            {"success":true,"credits_used":0.0,"data":{"gstin":"33ABCDE1234F1Z7",
             "lgnm":"TEST MEDICALS PRIVATE LIMITED","tradeNam":"TEST MEDICALS","sts":"Active","rgdt":"12/12/2023",
             "ctb":"Private Limited Company","dty":"Regular","cxdt":"","einvoiceStatus":"No",
             "nba":["Retail Business","Wholesale Business"],
             "structured_address":{"address_line1":"1 TEST STREET","address_line2":"TEST NAGAR","city":"Chennai",
              "state":"Tamil Nadu","pincode":"600001"}}}""";

    private HttpServer server;
    private final AtomicReference<Integer> status = new AtomicReference<>(200);
    private final AtomicReference<String> body = new AtomicReference<>(OK_BODY);
    private final AtomicReference<Long> delayMillis = new AtomicReference<>(0L);
    private final AtomicReference<String> lastQuery = new AtomicReference<>();

    @BeforeEach
    void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/api/v1/gst/details", exchange -> {
            lastQuery.set(exchange.getRequestURI().getQuery());
            try {
                Thread.sleep(delayMillis.get());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            byte[] bytes = body.get().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status.get(), bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void stop() {
        server.stop(0);
    }

    private GstVerifyAdapter adapter(Duration timeout) {
        return new GstVerifyAdapter(new GstinProviderProperties("gstverify",
                "http://127.0.0.1:" + server.getAddress().getPort(), null, timeout),
                Clock.fixed(Instant.parse("2026-11-26T10:00:00Z"), ZoneOffset.UTC));
    }

    @Test
    void mapsTheProviderFields() {
        var d = adapter(Duration.ofSeconds(2)).lookup(GSTIN);

        assertThat(lastQuery.get()).isEqualTo("gstin=33ABCDE1234F1Z7&full=false");
        assertThat(d.legalName()).isEqualTo("TEST MEDICALS PRIVATE LIMITED");
        assertThat(d.tradeName()).isEqualTo("TEST MEDICALS");
        assertThat(d.status()).isEqualTo("ACTIVE");
        assertThat(d.registrationType()).isEqualTo("REGULAR");
        assertThat(d.registeredOn()).isEqualTo(LocalDate.of(2023, 12, 12));
        assertThat(d.cancelledOn()).isNull();
        assertThat(d.eInvoiceEnabled()).isFalse();
        assertThat(d.natureOfBusiness()).containsExactly("Retail Business", "Wholesale Business");
        assertThat(d.address().pin()).isEqualTo("600001");
        assertThat(d.source()).isEqualTo("gstverify");
    }

    @Test
    void providerErrorsBecomeOurFailures() {
        status.set(400);
        body.set("{\"success\":false,\"detail\":\"Invalid GSTIN / UID\"}");
        assertFailure(Failure.NOT_FOUND);
        status.set(429);
        assertFailure(Failure.RATE_LIMITED);
        status.set(403);
        assertFailure(Failure.UNAVAILABLE);
        status.set(502);
        assertFailure(Failure.UNAVAILABLE);
    }

    @Test
    void slowProviderTimesOutAsUnavailable() {
        delayMillis.set(1500L);
        assertThatThrownBy(() -> adapter(Duration.ofMillis(300)).lookup(GSTIN))
                .isInstanceOfSatisfying(GstinLookupException.class,
                        e -> assertThat(e.failure()).isEqualTo(Failure.UNAVAILABLE));
    }

    @Test
    void statusAndTypeMapping() {
        assertThat(GstVerifyAdapter.status("Cancelled")).isEqualTo("CANCELLED");
        assertThat(GstVerifyAdapter.status("Suspended")).isEqualTo("SUSPENDED");
        assertThat(GstVerifyAdapter.status("odd")).isEqualTo("UNKNOWN");
        assertThat(GstVerifyAdapter.registrationType("SEZ Unit")).isEqualTo("SEZ_UNIT");
        assertThat(GstVerifyAdapter.date("31/02/2024")).isNull();
    }

    private void assertFailure(Failure expected) {
        assertThatThrownBy(() -> adapter(Duration.ofSeconds(2)).lookup(GSTIN))
                .isInstanceOfSatisfying(GstinLookupException.class, e -> assertThat(e.failure()).isEqualTo(expected));
    }
}
