package com.setupsworks.meno.modules.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
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
 * Team step (AUT-09) on PostgreSQL 17: options from data, invite rules, resend / revoke, the onboarding checklist,
 * and cross-tenant isolation (404 for another tenant's invitation, its branches rejected). Synthetic data only.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=team-terms",
        "meno.identity.invitation.link-base=https://app.test/invite?token=",
        "meno.identity.invitation.resend-cooldown=PT0S"
})
@AutoConfigureMockMvc
class TeamInvitationIntegrationTest {

    private static final Pattern LINK = Pattern.compile("https://app\\.test/invite\\?token=([A-Za-z0-9_-]+)");
    private static final String COMPANY = """
            {"registrationType":"REGULAR","gstin":"33ABCDE1234F1Z7","legalName":"Team Medicals Private Limited",
             "pan":"ABCDE1234F","addressLine1":"1 Test Street","pin":"600001","city":"Chennai","stateCode":"33"}""";

    @Autowired
    MockMvc mvc;

    @MockitoBean
    EmailSender emailSender;

    /** Mockito default: enabled() == false, i.e. no SMS provider configured (the real default today). */
    @MockitoBean
    SmsSender smsSender;

    @Test
    void ownerInvitesResendsAndRevokesWithEveryRuleChecked() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "team", "team-terms");
        String branchId = headOffice(owner);

        call(get("/api/v1/team/options"), owner, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[0].code").value("BRANCH_MANAGER"))
                .andExpect(jsonPath("$.roles[?(@.code == 'PHARMACIST')].label").value("Pharmacist"))
                .andExpect(jsonPath("$.roles[?(@.code == 'OWNER')]").isEmpty())
                .andExpect(jsonPath("$.branches[0].id").value(branchId))
                .andExpect(jsonPath("$.branches[0].headOffice").value(true))
                .andExpect(jsonPath("$.smsAvailable").value(false))
                .andExpect(jsonPath("$.invitationValidDays").value(7));
        call(get("/api/v1/onboarding"), owner, null)
                .andExpect(jsonPath("$.steps[?(@.code == 'TEAM')].status").value("TODO"));

        // Field and business rules.
        call(post("/api/v1/team/invitations"), owner, invite("Asha", "", "", "PHARMACIST", branchId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_INVITATION_CONTACT_REQUIRED"));
        call(post("/api/v1/team/invitations"), owner, invite("Asha", "asha@team.test", "", "OWNER", branchId))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_INVALID"));
        call(post("/api/v1/team/invitations"), owner,
                invite("Asha", "asha@team.test", "", "PHARMACIST", UUID.randomUUID().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_INVITATION_BRANCH_INVALID"));
        call(post("/api/v1/team/invitations"), owner, """
                {"fullName":"Asha","email":"asha@team.test","roleCode":"PHARMACIST","branchIds":[]}""")
                .andExpect(status().isBadRequest());
        call(post("/api/v1/team/invitations"), owner, invite("Asha", "", "12345", "PHARMACIST", branchId))
                .andExpect(status().isBadRequest());
        call(post("/api/v1/team/invitations"), owner,
                invite("Asha", "", CrossTenantSupport.uniqueMobile(), "PHARMACIST", branchId))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("NOTIFICATION_CHANNEL_DISABLED"));
        call(post("/api/v1/team/invitations"), owner, invite("Me", owner.email(), "", "PHARMACIST", branchId))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_EMAIL_TAKEN"));

        // Invite by email (+ mobile kept for the record): sent after commit, step done.
        String mobile = CrossTenantSupport.uniqueMobile();
        String json = call(post("/api/v1/team/invitations"), owner,
                invite("Asha Pharmacist", "Asha@Team.Test", mobile, "PHARMACIST", branchId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.email").value("asha@team.test"))
                .andExpect(jsonPath("$.mobile").value("+91" + mobile))
                .andExpect(jsonPath("$.roleLabel").value("Pharmacist"))
                .andExpect(jsonPath("$.branches[0].code").value("HO"))
                .andExpect(jsonPath("$.sendCount").value(1))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(json, "$.id");
        String firstToken = lastToken("asha@team.test");
        call(get("/api/v1/onboarding"), owner, null)
                .andExpect(jsonPath("$.steps[?(@.code == 'TEAM')].status").value("DONE"));

        // One open invitation per person.
        call(post("/api/v1/team/invitations"), owner, invite("Asha", "asha@team.test", "", "BILLING_OPERATOR", branchId))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_INVITATION_PENDING"));

        // Resend: new link, count goes up.
        call(post("/api/v1/team/invitations/" + id + "/resend"), owner, null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.sendCount").value(2));
        assertThat(lastToken("asha@team.test")).isNotEqualTo(firstToken);

        call(get("/api/v1/team/invitations"), owner, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].id").value(id));

        // Revoke once; afterwards it can't be resent or revoked, and the person can be invited again.
        call(post("/api/v1/team/invitations/" + id + "/revoke"), owner, null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("REVOKED"));
        call(post("/api/v1/team/invitations/" + id + "/revoke"), owner, null)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_INVITATION_NOT_PENDING"));
        call(post("/api/v1/team/invitations/" + id + "/resend"), owner, null)
                .andExpect(status().isConflict());
        call(post("/api/v1/team/invitations"), owner, invite("Asha", "asha@team.test", "", "PHARMACIST", branchId))
                .andExpect(status().isCreated());
    }

    @Test
    void anotherTenantsInvitationsAndBranchesAreInvisible() throws Exception {
        SignedUp a = CrossTenantSupport.signUp(mvc, "ta", "team-terms");
        SignedUp b = CrossTenantSupport.signUp(mvc, "tb", "team-terms");
        String branchA = headOffice(a);
        String id = JsonPath.read(call(post("/api/v1/team/invitations"), a,
                invite("Ravi", "ravi@team.test", "", "ACCOUNTANT", branchA))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(), "$.id");

        // B sees nothing of A, gets 404 (never 403) for A's id, and can't use A's branch.
        call(get("/api/v1/team/invitations"), b, null).andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.totalItems").value(0));
        call(get("/api/v1/team/options"), b, null).andExpect(jsonPath("$.branches").isEmpty());
        call(post("/api/v1/team/invitations/" + id + "/resend"), b, null)
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("IDENTITY_INVITATION_NOT_FOUND"));
        call(post("/api/v1/team/invitations/" + id + "/revoke"), b, null).andExpect(status().isNotFound());
        call(post("/api/v1/team/invitations"), b, invite("Ravi", "ravi.b@team.test", "", "ACCOUNTANT", branchA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_INVITATION_BRANCH_INVALID"));

        // A's invitation is untouched.
        call(get("/api/v1/team/invitations"), a, null).andExpect(jsonPath("$.items[0].status").value("PENDING"));
        mvc.perform(get("/api/v1/team/invitations")).andExpect(status().isUnauthorized());
    }

    // ---------------------------------------------------------------- helpers

    private ResultActions call(MockHttpServletRequestBuilder req, SignedUp who, String body) throws Exception {
        req.header("Authorization", who.bearer());
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(req);
    }

    /** Business profile + company + head office through the real onboarding API; returns the branch id. */
    private String headOffice(SignedUp owner) throws Exception {
        call(put("/api/v1/onboarding/business"), owner, """
                {"businessType":"RETAIL","branchCount":"ONE","catalogueSize":"UNDER_2000","currentSoftware":"NONE",
                 "language":"EN"}""").andExpect(status().isOk());
        call(put("/api/v1/onboarding/company"), owner, COMPANY).andExpect(status().isOk());
        String json = call(post("/api/v1/onboarding/branches"), owner, """
                {"name":"Main shop","code":"HO","addressLine1":"1 Test Street","pin":"600001","city":"Chennai",
                 "stateCode":"33"}""").andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.id");
    }

    private static String invite(String name, String email, String mobile, String role, String branchId) {
        return """
                {"fullName":"%s","email":"%s","mobile":"%s","roleCode":"%s","branchIds":["%s"]}"""
                .formatted(name, email, mobile, role, branchId);
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
}
