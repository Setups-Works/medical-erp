package com.setupsworks.meno.modules.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.jayway.jsonpath.JsonPath;
import com.setupsworks.meno.modules.notification.api.EmailSender;
import com.setupsworks.meno.modules.notification.api.EmailSender.OutgoingEmail;
import com.setupsworks.meno.modules.notification.api.SmsSender;
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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Accept invitation (PLT-06) on PostgreSQL 17: preview, join and sign in, the new person's role / branch / tenant,
 * one-time links (used, revoked, replaced by a resend all answer 410), one email / mobile per MENO user, password rule,
 * and cross-tenant isolation. Synthetic data only.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=accept-terms",
        "meno.identity.invitation.link-base=https://app.test/invite?token=",
        "meno.identity.invitation.resend-cooldown=PT0S",
        "meno.rate-limit.enabled=false"
})
@AutoConfigureMockMvc
class InvitationAcceptIntegrationTest {

    private static final Pattern LINK = Pattern.compile("https://app\\.test/invite\\?token=([A-Za-z0-9_-]+)");
    private static final String PASSWORD = "joiner-pass-123";
    private static final String COMPANY = """
            {"registrationType":"REGULAR","gstin":"33ABCDE1234F1Z7","legalName":"Accept Medicals Private Limited",
             "pan":"ABCDE1234F","addressLine1":"1 Test Street","pin":"600001","city":"Chennai","stateCode":"33"}""";

    @Autowired
    MockMvc mvc;

    @MockitoBean
    EmailSender emailSender;

    @MockitoBean
    SmsSender smsSender;

    @Test
    void invitedPersonPreviewsJoinsAndSignsInWithTheInvitedRoleAndBranch() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "join", "accept-terms");
        String branch = headOffice(owner);
        String id = invite(owner, "Asha Pharmacist", "asha.join@accept.test", "PHARMACIST", branch);
        String token = lastToken("asha.join@accept.test");

        mvc.perform(get("/api/v1/invitations/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessName").value("join Medicals"))
                .andExpect(jsonPath("$.roleName").value("Pharmacist"))
                .andExpect(jsonPath("$.branchNames[0]").value("Main shop"))
                .andExpect(jsonPath("$.invitedByName").value("Owner join"))
                .andExpect(jsonPath("$.contactMasked").value("a•••@accept.test"))
                .andExpect(jsonPath("$.minPasswordLength").value(10));

        // Rules before anything is created.
        accept(token, "Asha", CrossTenantSupport.uniqueMobile(), "short")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_PASSWORD_TOO_SHORT"));
        accept(token, "Asha", "12345", PASSWORD).andExpect(status().isBadRequest());
        accept(token, "Asha", owner.mobile(), PASSWORD)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_MOBILE_TAKEN"));

        String json = accept(token, "Asha P", CrossTenantSupport.uniqueMobile(), PASSWORD)
                .andExpect(status().isOk())
                .andExpect(cookie().exists("meno_refresh"))
                .andExpect(jsonPath("$.user.tenantId").value(owner.tenantId().toString()))
                .andExpect(jsonPath("$.user.email").value("asha.join@accept.test"))
                .andExpect(jsonPath("$.user.roles[0]").value("PHARMACIST"))
                .andReturn().getResponse().getContentAsString();
        String bearer = "Bearer " + JsonPath.read(json, "$.accessToken");
        String userId = JsonPath.read(json, "$.user.id");
        mvc.perform(get("/api/v1/auth/me").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.roles[0]").value("PHARMACIST"));

        // The owner sees the new person with the invited branch, and the invitation as joined.
        call(get("/api/v1/admin/users/" + userId), owner.bearer(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Asha P"))
                .andExpect(jsonPath("$.branches[0].id").value(branch))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
        call(get("/api/v1/team/invitations"), owner.bearer(), null)
                .andExpect(jsonPath("$.items[?(@.id == '%s')].status".formatted(id)).value("ACCEPTED"));

        // One-time: the link is dead afterwards, and the new password signs in.
        mvc.perform(get("/api/v1/invitations/" + token))
                .andExpect(status().isGone()).andExpect(jsonPath("$.code").value("IDENTITY_INVITATION_INVALID"));
        accept(token, "Again", CrossTenantSupport.uniqueMobile(), PASSWORD).andExpect(status().isGone());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"asha.join@accept.test\",\"password\":\"%s\"}".formatted(PASSWORD)))
                .andExpect(status().isOk());
    }

    @Test
    void revokedReplacedAndUnknownLinksAllLookTheSame() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "dead", "accept-terms");
        String branch = headOffice(owner);
        String revokedId = invite(owner, "Ravi", "ravi.dead@accept.test", "ACCOUNTANT", branch);
        String revoked = lastToken("ravi.dead@accept.test");
        call(post("/api/v1/team/invitations/" + revokedId + "/revoke"), owner.bearer(), null)
                .andExpect(status().isOk());

        String resentId = invite(owner, "Kavi", "kavi.dead@accept.test", "BILLING_OPERATOR", branch);
        String old = lastToken("kavi.dead@accept.test");
        call(post("/api/v1/team/invitations/" + resentId + "/resend"), owner.bearer(), null)
                .andExpect(status().isOk());
        String fresh = lastToken("kavi.dead@accept.test");

        for (String dead : List.of(revoked, old, "no-such-token", "x".repeat(101))) {
            mvc.perform(get("/api/v1/invitations/" + dead))
                    .andExpect(status().isGone()).andExpect(jsonPath("$.code").value("IDENTITY_INVITATION_INVALID"));
        }
        accept(revoked, "Ravi", CrossTenantSupport.uniqueMobile(), PASSWORD).andExpect(status().isGone());
        mvc.perform(get("/api/v1/invitations/" + fresh)).andExpect(status().isOk());
    }

    @Test
    void anEmailThatAlreadyHasAnAccountElsewhereCannotJoinAndTenantsStaySeparate() throws Exception {
        SignedUp a = CrossTenantSupport.signUp(mvc, "ea", "accept-terms");
        SignedUp b = CrossTenantSupport.signUp(mvc, "eb", "accept-terms");
        String branchA = headOffice(a);
        // A invites B's owner by email: the invite is allowed (it can't reveal B), joining is not.
        invite(a, "B Owner", b.email(), "PHARMACIST", branchA);
        accept(lastToken(b.email()), "B Owner", CrossTenantSupport.uniqueMobile(), PASSWORD)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_EMAIL_TAKEN"));

        // Someone who joins A is invisible to B.
        invite(a, "Mani", "mani.ea@accept.test", "PHARMACIST", branchA);
        String json = accept(lastToken("mani.ea@accept.test"), "Mani", CrossTenantSupport.uniqueMobile(), PASSWORD)
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String maniId = JsonPath.read(json, "$.user.id");
        call(get("/api/v1/admin/users/" + maniId), b.bearer(), null).andExpect(status().isNotFound());
        call(get("/api/v1/admin/users?status=ALL"), b.bearer(), null).andExpect(jsonPath("$.totalItems").value(1));
        call(get("/api/v1/admin/users/" + maniId), a.bearer(), null).andExpect(status().isOk());
    }

    // ---------------------------------------------------------------- helpers

    private ResultActions accept(String token, String name, String mobile, String password) throws Exception {
        return mvc.perform(post("/api/v1/invitations/" + token + "/accept").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"%s\",\"mobile\":\"%s\",\"password\":\"%s\"}".formatted(name, mobile,
                        password)));
    }

    private ResultActions call(MockHttpServletRequestBuilder req, String bearer, String body) throws Exception {
        req.header("Authorization", bearer);
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(req);
    }

    private String invite(SignedUp owner, String name, String email, String role, String branchId) throws Exception {
        String json = call(post("/api/v1/team/invitations"), owner.bearer(), """
                {"fullName":"%s","email":"%s","roleCode":"%s","branchIds":["%s"]}"""
                .formatted(name, email, role, branchId))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.id");
    }

    private String lastToken(String to) {
        ArgumentCaptor<OutgoingEmail> sent = ArgumentCaptor.forClass(OutgoingEmail.class);
        verify(emailSender, atLeastOnce()).send(sent.capture());
        List<OutgoingEmail> mine = sent.getAllValues().stream().filter(e -> e.to().equals(to)).toList();
        assertThat(mine).isNotEmpty();
        Matcher m = LINK.matcher(mine.getLast().text());
        assertThat(m.find()).isTrue();
        return m.group(1);
    }

    private String headOffice(SignedUp owner) throws Exception {
        call(put("/api/v1/onboarding/business"), owner.bearer(), """
                {"businessType":"RETAIL","branchCount":"ONE","catalogueSize":"UNDER_2000","currentSoftware":"NONE",
                 "language":"EN"}""").andExpect(status().isOk());
        call(put("/api/v1/onboarding/company"), owner.bearer(), COMPANY).andExpect(status().isOk());
        String json = call(post("/api/v1/onboarding/branches"), owner.bearer(), """
                {"name":"Main shop","code":"HO","addressLine1":"1 Test Street","pin":"600001","city":"Chennai",
                 "stateCode":"33"}""").andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.id");
    }
}
