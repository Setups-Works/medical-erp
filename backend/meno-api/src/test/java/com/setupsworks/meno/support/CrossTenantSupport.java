package com.setupsworks.meno.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import com.jayway.jsonpath.JsonPath;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Cross-tenant test base (MULTI_TENANCY.md layer 5): signs up independent tenants through the real API so a test
 * can act as tenant A and check that tenant B's data is invisible (404, never 403). Terms version must match
 * {@code meno.signup.terms-version} in the test's properties.
 */
public final class CrossTenantSupport {

    /** {@code mobile} is the 10 digits sent at sign-up (stored as +91…). */
    public record SignedUp(UUID tenantId, UUID userId, String accessToken, String email, String mobile) {

        public String bearer() {
            return "Bearer " + accessToken;
        }
    }

    private CrossTenantSupport() {
    }

    /** Mobile is unique per user (ux_app_user_mobile), so every signed-up tenant gets its own number. */
    public static String uniqueMobile() {
        return "9" + String.format("%09d", ThreadLocalRandom.current().nextLong(1_000_000_000L));
    }

    public static SignedUp signUp(MockMvc mvc, String label, String termsVersion) throws Exception {
        String email = label + "-" + UUID.randomUUID() + "@tenant.test";
        String mobile = uniqueMobile();
        String body = """
                {"ownerName":"Owner %s","mobile":"%s","email":"%s","password":"tenant-pass-123",
                 "businessName":"%s Medicals","stateCode":"33","startWith":"TRIAL","acceptedTermsVersion":"%s"}"""
                .formatted(label, mobile, email, label, termsVersion);
        String json = mvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return new SignedUp(UUID.fromString(JsonPath.read(json, "$.user.tenantId")),
                UUID.fromString(JsonPath.read(json, "$.user.id")), JsonPath.read(json, "$.accessToken"), email, mobile);
    }
}
