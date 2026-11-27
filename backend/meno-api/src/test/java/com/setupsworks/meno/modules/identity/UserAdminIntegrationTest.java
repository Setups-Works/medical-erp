package com.setupsworks.meno.modules.identity;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import com.jayway.jsonpath.JsonPath;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.notification.api.EmailSender;
import com.setupsworks.meno.security.TenantContext;
import com.setupsworks.meno.support.CrossTenantSupport;
import com.setupsworks.meno.support.CrossTenantSupport.SignedUp;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * User management (/admin/users, PLT-06) on PostgreSQL 17: list and search, role and branch changes with their rules,
 * optimistic locking, deactivate / reactivate (sign-in refused, then allowed), branch scope for a branch manager, and
 * cross-tenant isolation (404 for another tenant's user). Staff accounts are created directly because accepting an
 * invitation is a separate page. Synthetic data only.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=users-terms"
})
@AutoConfigureMockMvc
class UserAdminIntegrationTest {

    private static final String PASSWORD = "staff-pass-12345";
    private static final String COMPANY = """
            {"registrationType":"REGULAR","gstin":"33ABCDE1234F1Z7","legalName":"Users Medicals Private Limited",
             "pan":"ABCDE1234F","addressLine1":"1 Test Street","pin":"600001","city":"Chennai","stateCode":"33"}""";

    @Autowired
    MockMvc mvc;

    @Autowired
    AppUserRepository users;

    @Autowired
    PasswordEncoder passwordEncoder;

    @MockitoBean
    EmailSender emailSender;

    @Test
    void ownerChangesAccessDeactivatesAndReactivatesWithEveryRuleChecked() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "users", "users-terms");
        String ho = headOffice(owner);
        String b2 = branch(owner, "Second shop", "B2");
        AppUser priya = staff(owner, "Priya Pharmacist", "PHARMACIST", ho);

        call(get("/api/v1/admin/users/options"), owner.bearer(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[?(@.code == 'OWNER')].assignable").value(false))
                .andExpect(jsonPath("$.roles[?(@.code == 'OWNER')].allBranches").value(true))
                .andExpect(jsonPath("$.roles[?(@.code == 'BRANCH_MANAGER')].assignable").value(true))
                .andExpect(jsonPath("$.branches.length()").value(2));

        call(get("/api/v1/admin/users?status=ALL"), owner.bearer(), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[?(@.id == '%s')].allBranches".formatted(owner.userId())).value(true))
                .andExpect(jsonPath("$.items[?(@.id == '%s')].you".formatted(owner.userId())).value(true))
                .andExpect(jsonPath("$.items[?(@.id == '%s')].branches[0].code".formatted(priya.getId()))
                        .value("HO"));
        call(get("/api/v1/admin/users?q=priya"), owner.bearer(), null)
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].roles[0].label").value("Pharmacist"));

        String url = "/api/v1/admin/users/" + priya.getId();
        long version = version(owner, url);

        // Field and business rules.
        call(put(url + "/access"), owner.bearer(), access("OWNER", b2, version))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_INVALID"));
        call(put(url + "/access"), owner.bearer(), """
                {"roleCodes":[],"branchIds":["%s"],"version":%d}""".formatted(b2, version))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_REQUIRED"));
        call(put(url + "/access"), owner.bearer(), access("BRANCH_MANAGER", UUID.randomUUID().toString(), version))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_USER_BRANCH_INVALID"));
        call(put(url + "/access"), owner.bearer(), """
                {"roleCodes":["BRANCH_MANAGER"],"branchIds":[],"version":%d}""".formatted(version))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_USER_BRANCH_INVALID"));
        call(put(url + "/access"), owner.bearer(), "{\"roleCodes\":[\"PHARMACIST\"]}")
                .andExpect(status().isBadRequest());

        // Priya becomes branch manager of the second shop; a stale version is refused afterwards.
        call(put(url + "/access"), owner.bearer(), access("BRANCH_MANAGER", b2, version))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[0].code").value("BRANCH_MANAGER"))
                .andExpect(jsonPath("$.branches[0].code").value("B2"))
                .andExpect(jsonPath("$.version").value(version + 1));
        call(put(url + "/access"), owner.bearer(), access("PHARMACIST", ho, version))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMON_VERSION_CONFLICT"));

        // The owner role is never taken away here, and nobody deactivates themselves.
        String self = "/api/v1/admin/users/" + owner.userId();
        call(put(self + "/access"), owner.bearer(), access("PHARMACIST", ho, version(owner, self)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_INVALID"));
        call(post(self + "/deactivate"), owner.bearer(), null)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDENTITY_CANNOT_DEACTIVATE_SELF"));

        // Deactivated: can't sign in, hidden from the default (active) list; reactivated: can sign in again.
        login(priya.getEmail()).andExpect(status().isOk());
        call(post(url + "/deactivate"), owner.bearer(), null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DISABLED"));
        call(post(url + "/deactivate"), owner.bearer(), null)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDENTITY_USER_ALREADY_INACTIVE"));
        login(priya.getEmail()).andExpect(status().is4xxClientError());
        call(get("/api/v1/admin/users"), owner.bearer(), null).andExpect(jsonPath("$.totalItems").value(1));
        call(get("/api/v1/admin/users?status=DISABLED"), owner.bearer(), null)
                .andExpect(jsonPath("$.items[0].id").value(priya.getId().toString()));
        call(post(url + "/reactivate"), owner.bearer(), null)
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACTIVE"));
        login(priya.getEmail()).andExpect(status().isOk());
    }

    @Test
    void branchManagerSeesOnlyTheirBranchesAndCannotChangeAnyone() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "bm", "users-terms");
        String ho = headOffice(owner);
        String b2 = branch(owner, "Second shop", "B2");
        AppUser manager = staff(owner, "Mani Manager", "BRANCH_MANAGER", b2);
        AppUser colleague = staff(owner, "Kavi Cashier", "BILLING_OPERATOR", b2);
        AppUser elsewhere = staff(owner, "Ravi Elsewhere", "BILLING_OPERATOR", ho);
        String bm = "Bearer " + JsonPath.read(login(manager.getEmail()).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(), "$.accessToken");

        call(get("/api/v1/auth/me"), bm, null)
                .andExpect(jsonPath("$.permissions[?(@ == 'identity.user.view')]").isNotEmpty())
                .andExpect(jsonPath("$.permissions[?(@ == 'identity.user.manage')]").isEmpty());
        call(get("/api/v1/admin/users"), bm, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3)) // owner, the manager and the colleague at B2
                .andExpect(jsonPath("$.items[?(@.id == '%s')]".formatted(elsewhere.getId())).isEmpty());
        call(get("/api/v1/admin/users/options"), bm, null)
                .andExpect(jsonPath("$.branches.length()").value(1))
                .andExpect(jsonPath("$.branches[0].code").value("B2"));
        call(get("/api/v1/admin/users/" + elsewhere.getId()), bm, null).andExpect(status().isNotFound());
        call(post("/api/v1/admin/users/" + colleague.getId() + "/deactivate"), bm, null)
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COMMON_PERMISSION_DENIED"));
        call(put("/api/v1/admin/users/" + colleague.getId() + "/access"), bm, access("PHARMACIST", b2, 0))
                .andExpect(status().isForbidden());
    }

    @Test
    void anotherTenantsUsersAreInvisible() throws Exception {
        SignedUp a = CrossTenantSupport.signUp(mvc, "ua", "users-terms");
        SignedUp b = CrossTenantSupport.signUp(mvc, "ub", "users-terms");
        String branchA = headOffice(a);
        String branchB = headOffice(b);
        AppUser staffA = staff(a, "Asha A", "PHARMACIST", branchA);
        String url = "/api/v1/admin/users/" + staffA.getId();

        call(get("/api/v1/admin/users?status=ALL"), b.bearer(), null)
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].id").value(b.userId().toString()));
        call(get(url), b.bearer(), null)
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("IDENTITY_USER_NOT_FOUND"));
        call(put(url + "/access"), b.bearer(), access("PHARMACIST", branchB, 0)).andExpect(status().isNotFound());
        call(post(url + "/deactivate"), b.bearer(), null).andExpect(status().isNotFound());
        call(post(url + "/reactivate"), b.bearer(), null).andExpect(status().isNotFound());
        // A's branch can't be given to B's people either.
        String selfB = "/api/v1/admin/users/" + b.userId();
        AppUser staffB = staff(b, "Bala B", "PHARMACIST", branchB);
        call(put("/api/v1/admin/users/" + staffB.getId() + "/access"), b.bearer(),
                access("PHARMACIST", branchA, version(b, "/api/v1/admin/users/" + staffB.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_USER_BRANCH_INVALID"));

        call(get(url), a.bearer(), null).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACTIVE"));
        call(get(selfB), b.bearer(), null).andExpect(status().isOk());
        mvc.perform(get("/api/v1/admin/users")).andExpect(status().isUnauthorized());
    }

    // ---------------------------------------------------------------- helpers

    private ResultActions call(MockHttpServletRequestBuilder req, String bearer, String body) throws Exception {
        req.header("Authorization", bearer);
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(req);
    }

    private ResultActions login(String email) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"%s\",\"password\":\"%s\"}".formatted(email, PASSWORD)));
    }

    private long version(SignedUp who, String url) throws Exception {
        Number v = JsonPath.read(call(get(url), who.bearer(), null).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(), "$.version");
        return v.longValue();
    }

    private static String access(String role, String branchId, long version) {
        return """
                {"roleCodes":["%s"],"branchIds":["%s"],"version":%d}""".formatted(role, branchId, version);
    }

    /** A staff account as an accepted invitation would leave it (the /invite page isn't built yet). */
    private AppUser staff(SignedUp owner, String name, String role, String branchId) {
        return TenantContext.callAs(owner.tenantId(), owner.userId(), () -> {
            AppUser user = new AppUser(owner.tenantId(), UUID.randomUUID() + "@staff.test",
                    passwordEncoder.encode(PASSWORD), name, Set.of(role), Instant.now());
            user.changeAccess(Set.of(role), Set.of(UUID.fromString(branchId)), owner.userId(), Instant.now());
            return users.save(user);
        });
    }

    /** Business profile + company + head office through the real onboarding API; returns the branch id. */
    private String headOffice(SignedUp owner) throws Exception {
        call(put("/api/v1/onboarding/business"), owner.bearer(), """
                {"businessType":"RETAIL","branchCount":"TWO_TO_FIVE","catalogueSize":"UNDER_2000",
                 "currentSoftware":"NONE","language":"EN"}""").andExpect(status().isOk());
        call(put("/api/v1/onboarding/company"), owner.bearer(), COMPANY).andExpect(status().isOk());
        return branch(owner, "Main shop", "HO");
    }

    private String branch(SignedUp owner, String name, String code) throws Exception {
        String json = call(post("/api/v1/onboarding/branches"), owner.bearer(), """
                {"name":"%s","code":"%s","addressLine1":"1 Test Street","pin":"600001","city":"Chennai",
                 "stateCode":"33"}""".formatted(name, code))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.id");
    }
}
