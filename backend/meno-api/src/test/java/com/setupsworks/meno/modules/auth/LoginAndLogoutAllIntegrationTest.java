package com.setupsworks.meno.modules.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.setupsworks.meno.support.CrossTenantSupport;
import com.setupsworks.meno.support.CrossTenantSupport.SignedUp;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.junit.jupiter.Testcontainers;

/** PLT-08 on PostgreSQL: sign in with email or mobile, mobile unique per user, logout from all devices. */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=login-terms"
})
@AutoConfigureMockMvc
class LoginAndLogoutAllIntegrationTest {

    private static final String PASSWORD = "tenant-pass-123";

    @Autowired
    MockMvc mvc;

    @Test
    void signsInWithEmailOrMobileInAnyCommonForm() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "login", "login-terms");
        String m = owner.mobile();
        for (String identifier : new String[] {
                owner.email().toUpperCase(), m, "+91" + m, "91" + m, "+91 " + m.substring(0, 5) + " " + m.substring(5),
                m.substring(0, 5) + "-" + m.substring(5)}) {
            login(identifier, PASSWORD).andExpect(status().isOk())
                    .andExpect(jsonPath("$.user.id").value(owner.userId().toString()));
        }
    }

    @Test
    void unknownOrMalformedIdentifierLooksLikeAWrongPassword() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "wrong", "login-terms");
        for (String identifier : new String[] {"5876543210", "12345", "not-an-email", CrossTenantSupport.uniqueMobile()}) {
            login(identifier, PASSWORD).andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("AUTH_INVALID_CREDENTIALS"));
        }
        login(owner.mobile(), "wrong-password").andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH_INVALID_CREDENTIALS"));
    }

    @Test
    void secondSignUpWithTheSameMobileIsRefused() throws Exception {
        SignedUp first = CrossTenantSupport.signUp(mvc, "first", "login-terms");
        String body = """
                {"ownerName":"Second Owner","mobile":"%s","email":"second-%s","password":"tenant-pass-123",
                 "businessName":"Second Medicals","stateCode":"33","startWith":"TRIAL",
                 "acceptedTermsVersion":"login-terms"}""".formatted(first.mobile(), first.email());
        mvc.perform(post("/api/v1/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDENTITY_MOBILE_TAKEN"));
    }

    @Test
    void logoutAllEndsEverySessionOfThatUserOnly() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "devices", "login-terms");
        SignedUp other = CrossTenantSupport.signUp(mvc, "other", "login-terms");
        Cookie laptop = refreshCookie(login(owner.email(), PASSWORD));
        Cookie counterPc = refreshCookie(login(owner.mobile(), PASSWORD));
        Cookie otherTenant = refreshCookie(login(other.email(), PASSWORD));

        mvc.perform(post("/api/v1/auth/logout-all").header("Authorization", owner.bearer()))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("meno_refresh", 0));

        mvc.perform(post("/api/v1/auth/refresh").cookie(laptop)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/refresh").cookie(counterPc)).andExpect(status().isUnauthorized());
        // Another tenant's user keeps their session.
        mvc.perform(post("/api/v1/auth/refresh").cookie(otherTenant)).andExpect(status().isOk());
        // Signing in again still works.
        login(owner.email(), PASSWORD).andExpect(status().isOk());
    }

    @Test
    void logoutAllNeedsASignedInUser() throws Exception {
        mvc.perform(post("/api/v1/auth/logout-all")).andExpect(status().isUnauthorized());
    }

    private ResultActions login(String identifier, String password) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"" + identifier + "\",\"password\":\"" + password + "\"}"));
    }

    private static Cookie refreshCookie(ResultActions login) throws Exception {
        return login.andExpect(status().isOk()).andReturn().getResponse().getCookie("meno_refresh");
    }
}
