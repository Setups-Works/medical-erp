package com.setupsworks.meno.modules.identity;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
 * Role management (/admin/roles, PLT-07) on PostgreSQL 17: defaults and custom roles, rename and permission rules,
 * optimistic locking, permission changes taking effect for the people holding the role, reset to MENO's defaults,
 * archive rules, and cross-tenant isolation (another tenant's role is 404 and its overrides don't leak). Synthetic
 * data only.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=roles-terms"
})
@AutoConfigureMockMvc
class RoleAdminIntegrationTest {

    private static final String PASSWORD = "staff-pass-12345";
    private static final String COMPANY = """
            {"registrationType":"REGULAR","gstin":"33ABCDE1234F1Z7","legalName":"Roles Medicals Private Limited",
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
    void ownerCreatesRenamesChangesAndArchivesRolesWithEveryRuleChecked() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "roles", "roles-terms");
        String ho = headOffice(owner);
        String bearer = owner.bearer();

        call(get("/api/v1/admin/roles"), bearer, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("OWNER"))
                .andExpect(jsonPath("$[0].locked").value(true))
                .andExpect(jsonPath("$[0].activeUsers").value(1))
                .andExpect(jsonPath("$[?(@.code == 'BRANCH_MANAGER')].permissionCount").value(1))
                .andExpect(jsonPath("$[?(@.code == 'BRANCH_MANAGER')].custom").value(false));

        call(get("/api/v1/admin/permissions"), bearer, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modules[0].code").value("tenancy"))
                .andExpect(jsonPath("$.modules[?(@.code == 'identity')].label").value("Users and roles"))
                .andExpect(jsonPath("$.modules[?(@.code == 'identity')].permissions[?(@.code == 'identity.user.view')]"
                        + ".roleCodes[*]").value(org.hamcrest.Matchers.containsInAnyOrder("OWNER", "BRANCH_MANAGER")))
                .andExpect(jsonPath("$.roles[0].locked").value(true));

        // Create from a default role's permissions; names are unique per tenant, defaults included.
        String json = call(post("/api/v1/admin/roles"), bearer, """
                {"label":"Store auditor","description":"Reads staff lists","copyFrom":"BRANCH_MANAGER"}""")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.custom").value(true))
                .andExpect(jsonPath("$.permissionCodes[0]").value("identity.user.view"))
                .andExpect(jsonPath("$.permissionsVersion").value(1))
                .andReturn().getResponse().getContentAsString();
        String code = JsonPath.read(json, "$.code");
        call(post("/api/v1/admin/roles"), bearer, "{\"label\":\"store AUDITOR\"}")
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_NAME_TAKEN"));
        call(post("/api/v1/admin/roles"), bearer, "{\"label\":\"Pharmacist\"}")
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_NAME_TAKEN"));
        call(post("/api/v1/admin/roles"), bearer, "{\"label\":\"\"}").andExpect(status().isBadRequest());
        call(post("/api/v1/admin/roles"), bearer, "{\"label\":\"X\",\"copyFrom\":\"NOPE\"}")
                .andExpect(status().isNotFound());

        // Rename: own roles only, with the version in If-Match (missing is 428).
        call(put("/api/v1/admin/roles/" + code), bearer, "{\"label\":\"Staff auditor\"}")
                .andExpect(status().isPreconditionRequired());
        call(put("/api/v1/admin/roles/" + code).header("If-Match", etag(0)), bearer, "{\"label\":\"Staff auditor\"}")
                .andExpect(status().isOk()).andExpect(jsonPath("$.label").value("Staff auditor"))
                .andExpect(jsonPath("$.version").value(1));
        call(put("/api/v1/admin/roles/" + code).header("If-Match", etag(0)), bearer, "{\"label\":\"Again\"}")
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMON_VERSION_CONFLICT"));
        call(put("/api/v1/admin/roles/PHARMACIST").header("If-Match", etag(0)), bearer, "{\"label\":\"Chemist\"}")
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_NOT_EDITABLE"));

        // Permissions: known codes only, never on the locked owner role.
        call(put("/api/v1/admin/roles/PHARMACIST/permissions").header("If-Match", etag(0)), bearer, perms("identity.nope.view"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IDENTITY_PERMISSION_INVALID"));
        call(put("/api/v1/admin/roles/PHARMACIST/permissions").header("If-Match", etag(0)), bearer, perms("Not A Code"))
                .andExpect(status().isBadRequest());
        call(put("/api/v1/admin/roles/OWNER/permissions").header("If-Match", etag(0)), bearer, perms())
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_LOCKED"));
        call(put("/api/v1/admin/roles/PHARMACIST/permissions").header("If-Match", etag(0)), bearer, perms("party.customer.create"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customised").value(true))
                .andExpect(jsonPath("$.permissionsVersion").value(1));
        call(put("/api/v1/admin/roles/PHARMACIST/permissions").header("If-Match", etag(0)), bearer, perms())
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("COMMON_VERSION_CONFLICT"));

        // A change reaches the people holding the role: the branch manager loses the user list, then gets it back.
        AppUser manager = staff(owner, "Mani Manager", "BRANCH_MANAGER", ho);
        String bm = "Bearer " + JsonPath.read(login(manager.getEmail()), "$.accessToken");
        call(get("/api/v1/admin/users"), bm, null).andExpect(status().isOk());
        call(put("/api/v1/admin/roles/BRANCH_MANAGER/permissions").header("If-Match", etag(0)), bearer, perms())
                .andExpect(status().isOk()).andExpect(jsonPath("$.permissionCodes").isEmpty());
        call(get("/api/v1/admin/users"), bm, null).andExpect(status().isForbidden());
        call(post("/api/v1/admin/roles/BRANCH_MANAGER/reset"), bearer, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customised").value(false))
                .andExpect(jsonPath("$.permissionCodes[0]").value("identity.user.view"));
        call(get("/api/v1/admin/users"), bm, null).andExpect(status().isOk());
        call(post("/api/v1/admin/roles/" + code + "/reset"), bearer, null)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_NOT_EDITABLE"));

        // Custom roles can be invited and assigned; archived only once nobody active holds them.
        call(get("/api/v1/team/options"), bearer, null)
                .andExpect(jsonPath("$.roles[?(@.code == '%s')].label".formatted(code)).value("Staff auditor"));
        String url = "/api/v1/admin/users/" + manager.getId();
        call(put(url + "/access").header("If-Match", etag(version(bearer, url))), bearer, access(code, ho)).andExpect(status().isOk());
        call(delete("/api/v1/admin/roles/" + code), bearer, null)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_IN_USE"));
        call(put(url + "/access").header("If-Match", etag(version(bearer, url))), bearer, access("PHARMACIST", ho)).andExpect(status().isOk());
        call(delete("/api/v1/admin/roles/PHARMACIST"), bearer, null)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_NOT_EDITABLE"));
        call(delete("/api/v1/admin/roles/" + code), bearer, null).andExpect(status().isNoContent());
        call(get("/api/v1/admin/roles/" + code), bearer, null).andExpect(status().isNotFound());
        call(get("/api/v1/admin/roles"), bearer, null)
                .andExpect(jsonPath("$[?(@.code == '%s')]".formatted(code)).isEmpty());
        call(put(url + "/access").header("If-Match", etag(version(bearer, url))), bearer, access(code, ho))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_INVALID"));

        // Only people with identity.role.* see or change roles.
        call(get("/api/v1/admin/roles"), bm, null).andExpect(status().isForbidden());
    }

    @Test
    void anotherTenantsRolesAndChangesAreInvisible() throws Exception {
        SignedUp a = CrossTenantSupport.signUp(mvc, "ra", "roles-terms");
        SignedUp b = CrossTenantSupport.signUp(mvc, "rb", "roles-terms");
        String branchB = headOffice(b);
        String code = JsonPath.read(call(post("/api/v1/admin/roles"), a.bearer(), "{\"label\":\"Night shift\"}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(), "$.code");
        call(put("/api/v1/admin/roles/PHARMACIST/permissions").header("If-Match", etag(0)), a.bearer(), perms("party.customer.create"))
                .andExpect(status().isOk());

        // B never sees A's role, gets 404 for it, can't invite or assign with it, and keeps MENO's defaults.
        call(get("/api/v1/admin/roles"), b.bearer(), null)
                .andExpect(jsonPath("$[?(@.code == '%s')]".formatted(code)).isEmpty())
                .andExpect(jsonPath("$[?(@.code == 'PHARMACIST')].customised").value(false));
        call(get("/api/v1/admin/roles/" + code), b.bearer(), null)
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_NOT_FOUND"));
        call(put("/api/v1/admin/roles/" + code).header("If-Match", etag(0)), b.bearer(), "{\"label\":\"Mine\"}")
                .andExpect(status().isNotFound());
        call(put("/api/v1/admin/roles/" + code + "/permissions").header("If-Match", etag(1)), b.bearer(), perms())
                .andExpect(status().isNotFound());
        call(delete("/api/v1/admin/roles/" + code), b.bearer(), null).andExpect(status().isNotFound());
        call(post("/api/v1/admin/roles"), b.bearer(), "{\"label\":\"Copy\",\"copyFrom\":\"%s\"}".formatted(code))
                .andExpect(status().isNotFound());
        call(get("/api/v1/admin/roles/PHARMACIST"), b.bearer(), null)
                .andExpect(jsonPath("$.permissionCodes").isEmpty());
        call(get("/api/v1/admin/permissions"), b.bearer(), null)
                .andExpect(jsonPath("$.roles[?(@.code == '%s')]".formatted(code)).isEmpty())
                .andExpect(jsonPath("$.modules[?(@.code == 'party')].permissions[?(@.code == 'party.customer.create')]"
                        + ".roleCodes[*]").value(org.hamcrest.Matchers.contains("OWNER")));
        call(post("/api/v1/team/invitations"), b.bearer(), """
                {"fullName":"Ravi","email":"ravi@roles.test","roleCode":"%s","branchIds":["%s"]}"""
                .formatted(code, branchB))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_INVALID"));
        AppUser staffB = staff(b, "Bala B", "PHARMACIST", branchB);
        String url = "/api/v1/admin/users/" + staffB.getId();
        call(put(url + "/access").header("If-Match", etag(version(b.bearer(), url))), b.bearer(), access(code, branchB))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_INVALID"));

        call(get("/api/v1/admin/roles/" + code), a.bearer(), null).andExpect(status().isOk());
        mvc.perform(get("/api/v1/admin/roles")).andExpect(status().isUnauthorized());
    }

    // ---------------------------------------------------------------- helpers

    private ResultActions call(MockHttpServletRequestBuilder req, String bearer, String body) throws Exception {
        req.header("Authorization", bearer);
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(req);
    }

    private static String perms(String... codes) {
        String list = String.join("\",\"", codes);
        return "{\"permissionCodes\":[%s]}".formatted(codes.length == 0 ? "" : "\"" + list + "\"");
    }

    private static String access(String role, String branchId) {
        return "{\"roleCodes\":[\"%s\"],\"branchIds\":[\"%s\"]}".formatted(role, branchId);
    }

    private static String etag(long version) {
        return "\"" + version + "\"";
    }

    private long version(String bearer, String url) throws Exception {
        Number v = JsonPath.read(call(get(url), bearer, null).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(), "$.version");
        return v.longValue();
    }

    private String login(String email) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"%s\",\"password\":\"%s\"}".formatted(email, PASSWORD)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
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
