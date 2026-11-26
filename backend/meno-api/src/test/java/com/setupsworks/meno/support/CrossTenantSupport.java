package com.setupsworks.meno.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import com.jayway.jsonpath.JsonPath;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Cross-tenant test base (MULTI_TENANCY.md layer 5): signs up independent tenants through the real API so a test
 * can act as tenant A and check that tenant B's data is invisible (404, never 403). Terms version must match
 * {@code meno.signup.terms-version} in the test's properties.
 */
public final class CrossTenantSupport {

    public record SignedUp(UUID tenantId, UUID userId, String accessToken, String email) {

        public String bearer() {
            return "Bearer " + accessToken;
        }
    }

    private CrossTenantSupport() {
    }

    public static SignedUp signUp(MockMvc mvc, String label, String termsVersion) throws Exception {
        String email = label + "-" + UUID.randomUUID() + "@tenant.test";
        String body = """
                {"ownerName":"Owner %s","mobile":"9876543210","email":"%s","password":"tenant-pass-123",
                 "businessName":"%s Medicals","stateCode":"33","startWith":"TRIAL","acceptedTermsVersion":"%s"}"""
                .formatted(label, email, label, termsVersion);
        String json = mvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return new SignedUp(UUID.fromString(JsonPath.read(json, "$.user.tenantId")),
                UUID.fromString(JsonPath.read(json, "$.user.id")), JsonPath.read(json, "$.accessToken"), email);
    }
}
