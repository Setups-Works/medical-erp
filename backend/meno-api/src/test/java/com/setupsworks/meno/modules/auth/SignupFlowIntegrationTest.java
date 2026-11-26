package com.setupsworks.meno.modules.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import com.jayway.jsonpath.JsonPath;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Sign-up on real PostgreSQL 17: seeded states, constraints, one transaction, idempotent replay. */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=it-terms-1",
        "meno.identity.bootstrap.tenant-name=Bootstrap Pharmacy",
        "meno.identity.bootstrap.email=bootstrap@test.local",
        "meno.identity.bootstrap.password=bootstrap-pass-123"
})
@AutoConfigureMockMvc
class SignupFlowIntegrationTest {

    private static final String BODY = """
            {"ownerName":"Test Owner","mobile":"%s","email":"%s","password":"signup-pass-123",
             "businessName":"Test Medicals","stateCode":"%s","partnerCode":"","startWith":"TRIAL",
             "acceptedTermsVersion":"it-terms-1","website":"%s"}""";

    @Autowired
    MockMvc mvc;

    @Autowired
    JdbcTemplate jdbc;

    private static String body(String mobile, String email, String state, String honeypot) {
        return BODY.formatted(mobile, email, state, honeypot);
    }

    @Test
    void optionsListSeededStatesAndConfiguredValues() throws Exception {
        mvc.perform(get("/api/v1/auth/signup/options"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.open").value(true))
                .andExpect(jsonPath("$.termsVersion").value("it-terms-1"))
                .andExpect(jsonPath("$.minPasswordLength").value(10))
                .andExpect(jsonPath("$.startOptions[0]").value("TRIAL"))
                .andExpect(jsonPath("$.states[?(@.code == '33')].name").value("Tamil Nadu"))
                // Merged / retired codes are not offered for new sign-ups.
                .andExpect(jsonPath("$.states[?(@.code == '25')]").isEmpty());
    }

    @Test
    void signUpCreatesTenantOwnerConsentAndSignsIn() throws Exception {
        UUID key = UUID.randomUUID();
        MvcResult created = mvc.perform(post("/api/v1/auth/signup").header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("9876543210", "Owner.One@Test.Local", "33", "")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("owner.one@test.local"))
                .andExpect(jsonPath("$.user.roles[0]").value("OWNER"))
                .andExpect(cookie().httpOnly("meno_refresh", true))
                .andReturn();
        String json = created.getResponse().getContentAsString();
        String token = JsonPath.read(json, "$.accessToken");
        String userId = JsonPath.read(json, "$.user.id");
        String tenantId = JsonPath.read(json, "$.user.tenantId");

        // Its own tenant, not the bootstrap one (tenant isolation starts at sign-up).
        String bootstrapTenant = jdbc.queryForObject(
                "select tenant_id::text from app_user where email = 'bootstrap@test.local'", String.class);
        assertThat(tenantId).isNotEqualTo(bootstrapTenant);
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenantId));

        assertThat(jdbc.queryForObject("select state_code from tenant where id = ?::uuid", String.class, tenantId))
                .isEqualTo("33");
        assertThat(jdbc.queryForObject("select mobile from app_user where id = ?::uuid", String.class, userId))
                .isEqualTo("+919876543210");
        assertThat(jdbc.queryForObject("select version from consent where user_id = ?::uuid", String.class, userId))
                .isEqualTo("it-terms-1");

        // Same key again (network retry): same account, no second tenant.
        mvc.perform(post("/api/v1/auth/signup").header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("9876543210", "owner.one@test.local", "33", "")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(userId));
        assertThat(jdbc.queryForObject("select count(*) from tenant where signup_key = ?", Integer.class, key))
                .isEqualTo(1);

        // Same email without the key: conflict.
        mvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content(body("9876543211", "owner.one@test.local", "33", "")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDENTITY_EMAIL_TAKEN"));

        // The new owner can sign in with the password from sign-up.
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"owner.one@test.local\",\"password\":\"signup-pass-123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void invalidInputIsRejectedBeforeAnythingIsWritten() throws Exception {
        int tenantsBefore = jdbc.queryForObject("select count(*) from tenant", Integer.class);

        mvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content(body("5876543210", "a@test.local", "33", "")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content(body("9876543210", "b@test.local", "98", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANCY_STATE_UNKNOWN"));
        mvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content(body("9876543210", "c@test.local", "33", "http://spam.example")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_SIGNUP_REJECTED"));

        assertThat(jdbc.queryForObject("select count(*) from tenant", Integer.class)).isEqualTo(tenantsBefore);
    }
}
