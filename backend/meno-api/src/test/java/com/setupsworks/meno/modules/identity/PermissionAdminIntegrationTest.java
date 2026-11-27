package com.setupsworks.meno.modules.identity;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
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
 * Permission matrix (/admin/permissions, PLT-07) on PostgreSQL 17: give and take one permission from one role
 * (idempotent), the locked owner role, the change reaching the role's holders, the last-admin guard, and cross-tenant
 * isolation. Synthetic data only.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=perm-terms"
})
@AutoConfigureMockMvc
class PermissionAdminIntegrationTest {

    private static final String PASSWORD = "staff-pass-12345";
    private static final String CELL = "/api/v1/admin/permissions/%s/roles/%s";

    @Autowired
    MockMvc mvc;

    @Autowired
    AppUserRepository users;

    @Autowired
    PasswordEncoder passwordEncoder;

    @MockitoBean
    EmailSender emailSender;

    @Test
    void ownerGivesAndTakesPermissionsCellByCell() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "perm", "perm-terms");
        String bearer = owner.bearer();
        AppUser pharmacist = staff(owner, "Priya Pharmacist", "PHARMACIST");
        String ph = "Bearer " + JsonPath.read(login(pharmacist.getEmail()), "$.accessToken");
        call(get("/api/v1/admin/users"), ph, null).andExpect(status().isForbidden());

        call(put(CELL.formatted("identity.user.view", "PHARMACIST")), bearer)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("identity.user.view"))
                .andExpect(jsonPath("$.roleCodes[*]").value(containsInAnyOrder("OWNER", "BRANCH_MANAGER",
                        "PHARMACIST")));
        // Idempotent, and the holder can use it at once.
        call(put(CELL.formatted("identity.user.view", "PHARMACIST")), bearer).andExpect(status().isOk());
        call(get("/api/v1/admin/users"), ph, null).andExpect(status().isOk());
        call(get("/api/v1/admin/roles/PHARMACIST"), bearer, null)
                .andExpect(jsonPath("$.customised").value(true))
                .andExpect(jsonPath("$.permissionCodes[*]").value(contains("identity.user.view")));

        call(delete(CELL.formatted("identity.user.view", "PHARMACIST")), bearer)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roleCodes[*]").value(containsInAnyOrder("OWNER", "BRANCH_MANAGER")));
        call(delete(CELL.formatted("identity.user.view", "PHARMACIST")), bearer).andExpect(status().isOk());
        call(get("/api/v1/admin/users"), ph, null).andExpect(status().isForbidden());

        // Rules: the owner role is locked; unknown permission and role are 404; holders without manage get 403.
        call(delete(CELL.formatted("identity.user.view", "OWNER")), bearer)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_LOCKED"));
        call(put(CELL.formatted("identity.nope.view", "PHARMACIST")), bearer)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("IDENTITY_PERMISSION_NOT_FOUND"));
        call(put(CELL.formatted("identity.user.view", "NOPE")), bearer)
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_NOT_FOUND"));
        call(put(CELL.formatted("identity.user.view", "PHARMACIST")), ph).andExpect(status().isForbidden());
    }

    @Test
    void theLastPersonWhoCanManageCannotRemoveThatAccess() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "last", "perm-terms");
        // A co-manager role with the owner's permissions. Branch-limited people can't deactivate the owner through the
        // API, so the owner is switched off in the database to reach the guard.
        String code = JsonPath.read(call(post("/api/v1/admin/roles"), owner.bearer(),
                "{\"label\":\"Co-manager\",\"copyFrom\":\"OWNER\"}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(), "$.code");
        AppUser manager = staff(owner, "Mani Manager", code);
        String bearer = "Bearer " + JsonPath.read(login(manager.getEmail()), "$.accessToken");
        call(post("/api/v1/admin/users/" + owner.userId() + "/deactivate"), bearer, null)
                .andExpect(status().isForbidden());
        setOwnerActive(owner, false);

        call(delete(CELL.formatted("identity.role.manage", code)), bearer)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_LAST_ADMIN"));
        call(delete(CELL.formatted("identity.user.manage", code)), bearer)
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_LAST_ADMIN"));
        // Nothing was written: the role still has both.
        call(get("/api/v1/admin/roles/" + code), bearer, null)
                .andExpect(jsonPath("$.permissionCodes[?(@ == 'identity.role.manage')]").isNotEmpty())
                .andExpect(jsonPath("$.permissionCodes[?(@ == 'identity.user.manage')]").isNotEmpty());
        call(put("/api/v1/admin/roles/" + code + "/permissions").header("If-Match", "\"1\""), bearer,
                "{\"permissionCodes\":[]}")
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("IDENTITY_LAST_ADMIN"));
        // Once the owner is back, the co-manager can lose it.
        setOwnerActive(owner, true);
        call(delete(CELL.formatted("identity.role.manage", code)), bearer).andExpect(status().isOk());
    }

    @Test
    void anotherTenantsRolesAndGrantsAreInvisible() throws Exception {
        SignedUp a = CrossTenantSupport.signUp(mvc, "pa", "perm-terms");
        SignedUp b = CrossTenantSupport.signUp(mvc, "pb", "perm-terms");
        String code = JsonPath.read(call(post("/api/v1/admin/roles"), a.bearer(), "{\"label\":\"Night shift\"}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(), "$.code");
        call(put(CELL.formatted("party.customer.create", "PHARMACIST")), a.bearer()).andExpect(status().isOk());

        call(put(CELL.formatted("party.customer.create", code)), b.bearer())
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("IDENTITY_ROLE_NOT_FOUND"));
        call(delete(CELL.formatted("party.customer.create", code)), b.bearer()).andExpect(status().isNotFound());
        // B's grant answer and catalogue never mention A's role or A's change.
        call(put(CELL.formatted("party.supplier.create", "PHARMACIST")), b.bearer())
                .andExpect(jsonPath("$.roleCodes[*]").value(containsInAnyOrder("OWNER", "PHARMACIST")));
        call(get("/api/v1/admin/permissions"), b.bearer(), null)
                .andExpect(jsonPath("$.modules[?(@.code == 'party')].permissions[?(@.code == 'party.customer.create')]"
                        + ".roleCodes[*]").value(contains("OWNER")));
        call(get("/api/v1/admin/permissions"), a.bearer(), null)
                .andExpect(jsonPath("$.modules[?(@.code == 'party')].permissions[?(@.code == 'party.supplier.create')]"
                        + ".roleCodes[*]").value(contains("OWNER")));
        mvc.perform(put(CELL.formatted("party.customer.create", "PHARMACIST"))).andExpect(status().isUnauthorized());
    }

    // ---------------------------------------------------------------- helpers

    private ResultActions call(MockHttpServletRequestBuilder req, String bearer) throws Exception {
        return call(req, bearer, null);
    }

    private ResultActions call(MockHttpServletRequestBuilder req, String bearer, String body) throws Exception {
        req.header("Authorization", bearer);
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(req);
    }

    private String login(String email) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"%s\",\"password\":\"%s\"}".formatted(email, PASSWORD)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    }

    private void setOwnerActive(SignedUp owner, boolean active) {
        TenantContext.callAs(owner.tenantId(), owner.userId(), () -> {
            AppUser u = users.findById(owner.userId()).orElseThrow();
            if (active) {
                u.reactivate(null, Instant.now());
            } else {
                u.deactivate(null, Instant.now());
            }
            return users.save(u);
        });
    }

    /** A staff account with no branch: these tests only touch permissions, never branch-scoped data. */
    private AppUser staff(SignedUp owner, String name, String role) {
        return TenantContext.callAs(owner.tenantId(), owner.userId(), () -> users.save(new AppUser(owner.tenantId(),
                UUID.randomUUID() + "@staff.test", passwordEncoder.encode(PASSWORD), name, Set.of(role),
                Instant.now())));
    }
}
