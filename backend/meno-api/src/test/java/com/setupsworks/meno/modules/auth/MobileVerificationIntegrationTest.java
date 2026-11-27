package com.setupsworks.meno.modules.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.setupsworks.meno.modules.notification.api.EmailSender;
import com.setupsworks.meno.modules.notification.api.SmsSender;
import com.setupsworks.meno.modules.notification.api.SmsSender.OutgoingSms;
import com.setupsworks.meno.support.CrossTenantSupport;
import com.setupsworks.meno.support.CrossTenantSupport.SignedUp;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.junit.jupiter.Testcontainers;

/** Mobile OTP (AUT-04, ONBOARDING.md step 2): 6 digits, 3 tries, newest code only, own user only, resend throttled. */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=otp-terms",
        "meno.rate-limit.enabled=false"
})
@AutoConfigureMockMvc
class MobileVerificationIntegrationTest {

    private static final Pattern CODE = Pattern.compile("^(\\d{6}) is your MENO verification code");

    @Autowired
    MockMvc mvc;

    @MockitoBean
    SmsSender smsSender;

    @MockitoBean
    EmailSender emailSender;

    @BeforeEach
    void smsOn() {
        when(smsSender.enabled()).thenReturn(true);
    }

    @Test
    void codeFromTheSmsVerifiesTheMobileOnce() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "otp", "otp-terms");
        send(owner).andExpect(status().isAccepted());
        String code = lastCode(owner.mobile());

        mvc.perform(get("/api/v1/auth/verification").header("Authorization", owner.bearer()))
                .andExpect(jsonPath("$.mobileVerified").value(false));
        verifyCode(owner, code).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/auth/verification").header("Authorization", owner.bearer()))
                .andExpect(jsonPath("$.mobileVerified").value(true));

        verifyCode(owner, code).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDENTITY_ALREADY_VERIFIED"));
        send(owner).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDENTITY_ALREADY_VERIFIED"));
    }

    @Test
    void threeWrongCodesLockTheCode() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "otp-wrong", "otp-terms");
        send(owner).andExpect(status().isAccepted());
        String code = lastCode(owner.mobile());
        String wrong = code.equals("000000") ? "111111" : "000000";

        verifyCode(owner, wrong).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_VERIFICATION_INVALID"))
                .andExpect(jsonPath("$.attemptsLeft").value(2));
        verifyCode(owner, wrong).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.attemptsLeft").value(1));
        verifyCode(owner, wrong).andExpect(status().isLocked())
                .andExpect(jsonPath("$.code").value("IDENTITY_VERIFICATION_LOCKED"));
        // The right code no longer works: a new one is needed.
        verifyCode(owner, code).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_VERIFICATION_INVALID"));
    }

    @Test
    void resendIsThrottledAndTheCodeMustBeSixDigits() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "otp-resend", "otp-terms");
        send(owner).andExpect(status().isAccepted());
        send(owner).andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("IDENTITY_VERIFICATION_TOO_SOON"));
        verifyCode(owner, "12345").andExpect(status().isBadRequest());
    }

    @Test
    void anotherUsersCodeDoesNotVerifyYourMobile() throws Exception {
        SignedUp a = CrossTenantSupport.signUp(mvc, "otp-a", "otp-terms");
        SignedUp b = CrossTenantSupport.signUp(mvc, "otp-b", "otp-terms");
        send(a).andExpect(status().isAccepted());
        String codeOfA = lastCode(a.mobile());

        verifyCode(b, codeOfA).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_VERIFICATION_INVALID"));
        mvc.perform(get("/api/v1/auth/verification").header("Authorization", b.bearer()))
                .andExpect(jsonPath("$.mobileVerified").value(false));
        verifyCode(a, codeOfA).andExpect(status().isNoContent());
    }

    @Test
    void withNoSmsProviderSendingIsRefusedAndNothingIsSent() throws Exception {
        when(smsSender.enabled()).thenReturn(false);
        clearInvocations(smsSender);
        SignedUp owner = CrossTenantSupport.signUp(mvc, "otp-off", "otp-terms");
        send(owner).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("NOTIFICATION_CHANNEL_DISABLED"));
        verify(smsSender, never()).send(any());
    }

    @Test
    void endpointsNeedASignedInUser() throws Exception {
        mvc.perform(post("/api/v1/auth/verify-mobile/send")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/verify-mobile").contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"123456\"}")).andExpect(status().isUnauthorized());
    }

    private ResultActions send(SignedUp user) throws Exception {
        return mvc.perform(post("/api/v1/auth/verify-mobile/send").header("Authorization", user.bearer()));
    }

    private ResultActions verifyCode(SignedUp user, String code) throws Exception {
        return mvc.perform(post("/api/v1/auth/verify-mobile").header("Authorization", user.bearer())
                .contentType(MediaType.APPLICATION_JSON).content("{\"code\":\"" + code + "\"}"));
    }

    private String lastCode(String mobile) {
        ArgumentCaptor<OutgoingSms> sms = ArgumentCaptor.forClass(OutgoingSms.class);
        verify(smsSender, atLeastOnce()).send(sms.capture());
        OutgoingSms last = sms.getAllValues().stream().filter(s -> s.to().endsWith(mobile.substring(mobile.length() - 10)))
                .reduce((x, y) -> y).orElseThrow();
        Matcher m = CODE.matcher(last.text());
        assertThat(m.find()).isTrue();
        return m.group(1);
    }
}
