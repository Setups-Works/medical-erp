package com.setupsworks.meno.modules.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Full login flow against real PostgreSQL 17 (Flyway migrations included). Skipped without Docker. */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.identity.bootstrap.tenant-name=Test Pharmacy",
        "meno.identity.bootstrap.email=owner@test.local",
        "meno.identity.bootstrap.password=owner-pass-123"
})
@AutoConfigureMockMvc
class AuthFlowIntegrationTest {

    private static final String LOGIN = """
            {"email":"owner@test.local","password":"%s"}""";

    @Autowired
    MockMvc mvc;

    @Test
    void loginMeRefreshAndReuseDetection() throws Exception {
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());

        MvcResult login = mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(LOGIN.formatted("owner-pass-123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.roles[0]").value("OWNER"))
                .andExpect(cookie().httpOnly("meno_refresh", true))
                .andReturn();
        String accessToken = JsonPath.read(login.getResponse().getContentAsString(), "$.accessToken");
        Cookie refresh = login.getResponse().getCookie("meno_refresh");

        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("owner@test.local"));

        MvcResult refreshed = mvc.perform(post("/api/v1/auth/refresh").cookie(refresh))
                .andExpect(status().isOk())
                .andReturn();
        Cookie rotated = refreshed.getResponse().getCookie("meno_refresh");

        // Re-using the old (rotated) token is rejected and kills the whole session family.
        mvc.perform(post("/api/v1/auth/refresh").cookie(refresh))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_REFRESH_REUSED"));
        mvc.perform(post("/api/v1/auth/refresh").cookie(rotated)).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordIsAProblemDetail() throws Exception {
        mvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(LOGIN.formatted("wrong-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.type").value("https://meno.app/problems/auth-invalid-credentials"));
    }

    @Test
    void tamperedAccessTokenIsRejected() throws Exception {
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer eyJhbGciOiJub25lIn0.e30."))
                .andExpect(status().isUnauthorized());
    }
}
