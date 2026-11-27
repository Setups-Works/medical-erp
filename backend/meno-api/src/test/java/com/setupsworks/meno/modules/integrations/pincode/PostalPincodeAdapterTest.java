package com.setupsworks.meno.modules.integrations.pincode;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;

import com.setupsworks.meno.modules.integrations.api.PincodeDirectory.PincodeLookupException;
import com.setupsworks.meno.modules.integrations.api.PincodeDirectory.PostOffice;
import com.sun.net.httpserver.HttpServer;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** Recorded-shape answers of api.postalpincode.in from a local stub server; no live calls in CI. */
class PostalPincodeAdapterTest {

    private static final String FOUND = """
            [{"Message":"Number of pincode(s) found:2","Status":"Success","PostOffice":[
             {"Name":"Baroda House","Description":null,"BranchType":"Sub Post Office","DeliveryStatus":"Non-Delivery",
              "Circle":"Delhi","District":"Central Delhi","Division":"New Delhi Central","Region":"Delhi",
              "Block":"New Delhi","State":"Delhi","Country":"India","Pincode":"110001"},
             {"Name":"Stray","District":"Elsewhere","State":"Delhi","Country":"India","Pincode":"110002"}]}]""";
    private static final String UNKNOWN = "[{\"Message\":\"No records found\",\"Status\":\"Error\",\"PostOffice\":null}]";

    private HttpServer server;
    private final AtomicReference<Integer> status = new AtomicReference<>(200);
    private final AtomicReference<String> body = new AtomicReference<>(FOUND);
    private final AtomicReference<Long> delayMillis = new AtomicReference<>(0L);
    private final AtomicReference<String> lastPath = new AtomicReference<>();

    @BeforeEach
    void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/pincode/", exchange -> {
            lastPath.set(exchange.getRequestURI().getPath());
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

    private PostalPincodeAdapter adapter(Duration timeout) {
        return new PostalPincodeAdapter(new PincodeProviderProperties("postalpincode",
                "http://127.0.0.1:" + server.getAddress().getPort(), timeout));
    }

    @Test
    void mapsTheOfficesOfThatPinOnly() {
        assertThat(adapter(Duration.ofSeconds(2)).postOffices("110001"))
                .containsExactly(new PostOffice("Baroda House", "Central Delhi", "Delhi"));
        assertThat(lastPath.get()).isEqualTo("/pincode/110001");
    }

    @Test
    void anUnknownPinIsEmptyNotAnError() {
        body.set(UNKNOWN);
        assertThat(adapter(Duration.ofSeconds(2)).postOffices("999999")).isEmpty();
    }

    @Test
    void errorsTimeoutsAndGarbageAreUnavailable() {
        status.set(503);
        assertThatThrownBy(() -> adapter(Duration.ofSeconds(2)).postOffices("110001"))
                .isInstanceOf(PincodeLookupException.class);

        status.set(200);
        body.set("<html>oops</html>");
        assertThatThrownBy(() -> adapter(Duration.ofSeconds(2)).postOffices("110001"))
                .isInstanceOf(PincodeLookupException.class);

        body.set(FOUND);
        delayMillis.set(1_500L);
        assertThatThrownBy(() -> adapter(Duration.ofMillis(300)).postOffices("110001"))
                .isInstanceOf(PincodeLookupException.class);
    }
}
