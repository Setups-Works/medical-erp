package com.setupsworks.meno.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Login is limited per client IP; other clients are not affected. */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.rate-limit.enabled=true",
        "meno.rate-limit.rules.login.capacity=3"
})
@AutoConfigureMockMvc
class RateLimitIntegrationTest {

    private static final String BODY = "{\"email\":\"nobody@test.local\",\"password\":\"wrong-password\"}";

    @Autowired
    MockMvc mvc;

    @Test
    void fourthLoginInAMinuteFromOneIpIsRejected() throws Exception {
        for (int i = 0; i < 3; i++) {
            mvc.perform(login("10.1.1.1")).andExpect(status().isUnauthorized());
        }
        mvc.perform(login("10.1.1.1"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.code").value("COMMON_RATE_LIMITED"));
        // Another address still gets through.
        mvc.perform(login("10.2.2.2")).andExpect(status().isUnauthorized());
    }

    private static org.springframework.test.web.servlet.RequestBuilder login(String ip) {
        return post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(BODY)
                .with(request -> {
                    request.setRemoteAddr(ip);
                    return request;
                });
    }
}
