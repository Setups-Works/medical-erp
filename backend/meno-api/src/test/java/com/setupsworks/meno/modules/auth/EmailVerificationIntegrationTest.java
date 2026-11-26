package com.setupsworks.meno.modules.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.setupsworks.meno.modules.notification.api.EmailSender;
import com.setupsworks.meno.modules.notification.api.EmailSender.OutgoingEmail;
import com.setupsworks.meno.support.CrossTenantSupport;
import com.setupsworks.meno.support.CrossTenantSupport.SignedUp;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Sign-up sends a one-time link after commit; the link confirms the email once; resend is throttled. */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=verify-terms",
        "meno.identity.verification.email-link-base=https://app.test/verify?token=",
        "meno.identity.verification.resend-cooldown=PT0S"
})
@AutoConfigureMockMvc
class EmailVerificationIntegrationTest {

    private static final Pattern LINK = Pattern.compile("https://app\\.test/verify\\?token=([A-Za-z0-9_-]+)");

    @Autowired
    MockMvc mvc;

    @MockitoBean
    EmailSender emailSender;

    @Test
    void linkFromTheSignupEmailConfirmsTheEmailOnce() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "verify", "verify-terms");
        String token = lastToken(owner.email());

        mvc.perform(get("/api/v1/auth/verification").header("Authorization", owner.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailVerified").value(false));

        mvc.perform(post("/api/v1/auth/verify-email").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/auth/verification").header("Authorization", owner.bearer()))
                .andExpect(jsonPath("$.emailVerified").value(true));

        // Single use.
        mvc.perform(post("/api/v1/auth/verify-email").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_VERIFICATION_INVALID"));
        mvc.perform(post("/api/v1/auth/verify-email/resend").header("Authorization", owner.bearer()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDENTITY_ALREADY_VERIFIED"));
    }

    @Test
    void resendReplacesTheOldLink() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "resend", "verify-terms");
        String first = lastToken(owner.email());
        clearInvocations(emailSender);

        mvc.perform(post("/api/v1/auth/verify-email/resend").header("Authorization", owner.bearer()))
                .andExpect(status().isAccepted());
        String second = lastToken(owner.email());
        assertThat(second).isNotEqualTo(first);

        mvc.perform(post("/api/v1/auth/verify-email").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + first + "\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/auth/verify-email").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + second + "\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    void unknownTokenIsInvalid() throws Exception {
        mvc.perform(post("/api/v1/auth/verify-email").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"not-a-real-token\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_VERIFICATION_INVALID"));
    }

    private String lastToken(String to) {
        ArgumentCaptor<OutgoingEmail> sent = ArgumentCaptor.forClass(OutgoingEmail.class);
        verify(emailSender, atLeastOnce()).send(sent.capture());
        OutgoingEmail email = sent.getAllValues().reversed().stream()
                .filter(e -> e.to().equals(to)).findFirst().orElseThrow();
        Matcher m = LINK.matcher(email.text());
        assertThat(m.find()).as("email contains the verification link").isTrue();
        return m.group(1);
    }
}
