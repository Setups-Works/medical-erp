package com.setupsworks.meno.modules.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.after;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
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

import jakarta.servlet.http.Cookie;

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

/** AUT-01 on PostgreSQL: same answer for unknown emails, single-use link, all sessions ended, new password works. */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=pw-terms",
        "meno.auth.password-reset.cooldown=PT0S",
        "meno.auth.password-reset.link-base=https://app.test/reset-password/?token="
})
@AutoConfigureMockMvc
class PasswordResetIntegrationTest {

    private static final Pattern LINK = Pattern.compile("https://app\\.test/reset-password/\\?token=([A-Za-z0-9_-]+)");

    @Autowired
    MockMvc mvc;

    @MockitoBean
    EmailSender emailSender;

    @Test
    void unknownEmailGetsTheSameAnswerAndNoEmail() throws Exception {
        forgot("nobody-here@test.local").andExpect(status().isAccepted());
        verify(emailSender, after(500).never()).send(any());
    }

    @Test
    void resetChangesThePasswordOnceAndEndsEverySession() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "pw", "pw-terms");
        Cookie oldSession = login(owner.email(), "tenant-pass-123");
        reset(emailSender);

        forgot(owner.email().toUpperCase()).andExpect(status().isAccepted());
        String token = tokenFromEmail(owner.email());

        // Too short: refused, and the link still works afterwards.
        resetWith(token, "short").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_PASSWORD_TOO_SHORT"));
        resetWith(token, "brand-new-pass-456").andExpect(status().isNoContent());

        // Single use.
        resetWith(token, "another-pass-789").andExpect(status().isGone())
                .andExpect(jsonPath("$.code").value("AUTH_RESET_TOKEN_INVALID"));
        // Old password no longer works, the new one does, and the old session is gone.
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(owner.email(), "tenant-pass-123")))
                .andExpect(status().isUnauthorized());
        login(owner.email(), "brand-new-pass-456");
        mvc.perform(post("/api/v1/auth/refresh").cookie(oldSession)).andExpect(status().isUnauthorized());
    }

    @Test
    void aNewerLinkReplacesTheOlderOne() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "pw2", "pw-terms");
        reset(emailSender);
        forgot(owner.email()).andExpect(status().isAccepted());
        String first = tokenFromEmail(owner.email());
        reset(emailSender);
        forgot(owner.email()).andExpect(status().isAccepted());
        String second = tokenFromEmail(owner.email());

        resetWith(first, "first-link-pass-1").andExpect(status().isGone());
        resetWith(second, "second-link-pass-2").andExpect(status().isNoContent());
    }

    @Test
    void unknownTokenIsGone() throws Exception {
        resetWith("not-a-real-token", "whatever-pass-1").andExpect(status().isGone());
    }

    private org.springframework.test.web.servlet.ResultActions forgot(String email) throws Exception {
        return mvc.perform(post("/api/v1/auth/password/forgot").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\"}"));
    }

    private org.springframework.test.web.servlet.ResultActions resetWith(String token, String password)
            throws Exception {
        return mvc.perform(post("/api/v1/auth/password/reset").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + token + "\",\"password\":\"" + password + "\"}"));
    }

    private Cookie login(String email, String password) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email, password)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("meno_refresh");
    }

    private static String loginBody(String email, String password) {
        return "{\"identifier\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }

    private String tokenFromEmail(String to) {
        ArgumentCaptor<OutgoingEmail> sent = ArgumentCaptor.forClass(OutgoingEmail.class);
        // Sent after commit on a background thread.
        verify(emailSender, timeout(5000)).send(sent.capture());
        OutgoingEmail email = sent.getValue();
        assertThat(email.to()).isEqualTo(to);
        assertThat(email.subject()).isEqualTo("Reset your MENO password");
        Matcher m = LINK.matcher(email.text());
        assertThat(m.find()).isTrue();
        return m.group(1);
    }
}
