package com.setupsworks.meno.modules.party;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.setupsworks.meno.modules.integrations.api.GstinVerifier;
import com.setupsworks.meno.modules.integrations.api.GstinVerifier.Failure;
import com.setupsworks.meno.modules.integrations.api.GstinVerifier.GstinDetails;
import com.setupsworks.meno.modules.integrations.api.GstinVerifier.GstinLookupException;
import com.setupsworks.meno.support.CrossTenantSupport;
import com.setupsworks.meno.support.CrossTenantSupport.SignedUp;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Testcontainers;

/** GET /api/v1/gstin-verifications/{gstin}: checks before the provider, error mapping, cache, auth. */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=gst-terms"
})
@AutoConfigureMockMvc
class GstinVerificationIntegrationTest {

    private static final String VALID = "33ABCDE1234F1Z7";
    private static final String UNKNOWN = "33ABCDE1234G1Z5";
    private static final String DOWN = "33ABCDE1234H1Z3";

    @Autowired
    MockMvc mvc;

    @MockitoBean
    GstinVerifier verifier;

    SignedUp owner;

    @BeforeEach
    void owner() throws Exception {
        owner = CrossTenantSupport.signUp(mvc, "gst", "gst-terms");
        when(verifier.source()).thenReturn("stub");
    }

    @Test
    void invalidGstinNeverReachesTheProvider() throws Exception {
        expect("33ABCDE1234F1Z8", 422).andExpect(jsonPath("$.code").value("PARTY_GSTIN_INVALID"))
                .andExpect(jsonPath("$.failedCheck").value("CHECK_CHARACTER"));
        expect("99ABCDE1234F1Z7", 422).andExpect(jsonPath("$.failedCheck").value("STATE"));
        expect("33ABCDE1234", 422).andExpect(jsonPath("$.failedCheck").value("FORMAT"));
        verify(verifier, never()).lookup(anyString());
    }

    @Test
    void validGstinReturnsDetailsAndIsCached() throws Exception {
        when(verifier.lookup(VALID)).thenReturn(new GstinDetails(VALID, "TEST MEDICALS PRIVATE LIMITED",
                "TEST MEDICALS", "ACTIVE", "REGULAR", LocalDate.of(2023, 12, 12), null, "Private Limited Company",
                List.of("Retail Business"), false, new GstinVerifier.Address("1 TEST STREET", null, "Chennai", "600001"),
                "stub", Instant.parse("2026-11-26T10:00:00Z")));

        expect(VALID.toLowerCase(), 200)
                .andExpect(jsonPath("$.gstin").value(VALID))
                .andExpect(jsonPath("$.legalName").value("TEST MEDICALS PRIVATE LIMITED"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.stateCode").value("33"))
                .andExpect(jsonPath("$.pan").value("ABCDE1234F"))
                .andExpect(jsonPath("$.address.pin").value("600001"));
        expect(VALID, 200);
        verify(verifier, times(1)).lookup(VALID);
    }

    @Test
    void providerFailuresMapToTheDocumentedCodes() throws Exception {
        when(verifier.lookup(UNKNOWN)).thenThrow(new GstinLookupException(Failure.NOT_FOUND, "x"));
        when(verifier.lookup(DOWN)).thenThrow(new GstinLookupException(Failure.UNAVAILABLE, "x"));
        expect(UNKNOWN, 404).andExpect(jsonPath("$.code").value("PARTY_GSTIN_NOT_FOUND"));
        expect(DOWN, 503).andExpect(jsonPath("$.code").value("PARTY_GSTIN_SERVICE_UNAVAILABLE"));
    }

    @Test
    void needsASignedInUser() throws Exception {
        mvc.perform(get("/api/v1/gstin-verifications/" + VALID)).andExpect(status().isUnauthorized());
    }

    private org.springframework.test.web.servlet.ResultActions expect(String gstin, int code) throws Exception {
        return mvc.perform(get("/api/v1/gstin-verifications/" + gstin).header("Authorization", owner.bearer()))
                .andExpect(status().is(code));
    }
}
