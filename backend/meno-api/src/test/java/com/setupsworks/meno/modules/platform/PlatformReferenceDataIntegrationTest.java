package com.setupsworks.meno.modules.platform;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import com.jayway.jsonpath.JsonPath;
import com.setupsworks.meno.support.CrossTenantSupport;
import com.setupsworks.meno.support.CrossTenantSupport.SignedUp;
import com.setupsworks.meno.support.TestcontainersConfiguration;
import com.setupsworks.meno.support.TestcontainersConfiguration.AdminSql;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * /platform/reference-data (PLT-22) and the platform realm (ADR-0020) on PostgreSQL 17: tokens never cross realms,
 * permissions gate the page, a file swaps the list, bad files are refused and recorded, and tenants can look up
 * PIN codes and IFSC. Synthetic data only.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=platform-terms",
        "meno.rate-limit.enabled=false",
        "meno.platform.bootstrap.email=Admin@Platform.test",
        "meno.platform.bootstrap.full-name=Test Admin",
        "meno.platform.bootstrap.password=platform-pass-123",
        "meno.platform.max-failed-attempts=3"
})
@AutoConfigureMockMvc
class PlatformReferenceDataIntegrationTest {

    private static final String ADMIN_EMAIL = "admin@platform.test";
    private static final String ADMIN_PASSWORD = "platform-pass-123";
    private static final String PINS = """
            OfficeName,Pincode,OfficeType,Delivery,District,StateName
            Anna Nagar S.O,600040,S.O,Delivery,CHENNAI,TAMIL NADU
            Anna Nagar East B.O,600040,B.O,Delivery,CHENNAI,TAMIL NADU
            Connaught Place H.O,110001,H.O,Delivery,NEW DELHI,DELHI
            Ambattur S.O,600053,S.O,Delivery,TIRUVALLUR,TAMIL NADU
            Nowhere B.O,500001,B.O,Delivery,X,ATLANTIS
            """;
    private static final String IFSC = """
            BANK,IFSC,BRANCH,CENTRE,DISTRICT,STATE,ADDRESS
            Test Bank,TEST0000001,Anna Nagar,CHENNAI,CHENNAI,TAMIL NADU,"2nd Avenue, Anna Nagar"
            """;

    @Autowired
    MockMvc mvc;

    @Autowired
    AdminSql admin;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Test
    void realmsNeverMixAndStaffSignInIsGuarded() throws Exception {
        SignedUp tenant = CrossTenantSupport.signUp(mvc, "platform", "platform-terms");
        String staff = login(ADMIN_EMAIL, ADMIN_PASSWORD);

        // Nobody signed in: 401 on both sides.
        mvc.perform(get("/api/v1/platform/reference-data")).andExpect(status().isUnauthorized());
        // A tenant token (even the owner's) never opens the platform, and a platform token never opens tenant data.
        mvc.perform(get("/api/v1/platform/reference-data").header("Authorization", tenant.bearer()))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/onboarding").header("Authorization", bearer(staff)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/reference/pincodes/600040").header("Authorization", bearer(staff)))
                .andExpect(status().isForbidden());
        // Tenant sign-in doesn't know staff, staff sign-in doesn't know tenant users.
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"%s\",\"password\":\"%s\"}".formatted(ADMIN_EMAIL, ADMIN_PASSWORD)))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/platform/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"tenant-pass-123\"}".formatted(tenant.email())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("PLATFORM_INVALID_CREDENTIALS"));
        // Tenant requests can't see staff rows even by SQL (RLS), whatever the app asks.
        mvc.perform(get("/api/v1/platform/auth/me").header("Authorization", bearer(staff)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(ADMIN_EMAIL))
                .andExpect(jsonPath("$.permissions").value(hasItem("platform.reference.manage")));

        // Lockout after max-failed-attempts (3 in this test).
        String lockEmail = "lock-" + UUID.randomUUID() + "@platform.test";
        staffWith(lockEmail, "platform.reference.view");
        for (int i = 0; i < 3; i++) {
            loginRaw(lockEmail, "wrong-password-1").andExpect(status().isUnauthorized());
        }
        loginRaw(lockEmail, "staff-pass-12345").andExpect(status().isLocked())
                .andExpect(jsonPath("$.code").value("PLATFORM_LOCKED"));
    }

    @Test
    void staffLoadListsTenantsLookThemUpAndBadFilesAreRefusedAndRecorded() throws Exception {
        String staff = login(ADMIN_EMAIL, ADMIN_PASSWORD);
        SignedUp tenant = CrossTenantSupport.signUp(mvc, "lookup", "platform-terms");

        mvc.perform(get("/api/v1/platform/reference-data").header("Authorization", bearer(staff)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(5))
                .andExpect(jsonPath("$.items[?(@.code == 'HSN')].status").value("LATER"))
                .andExpect(jsonPath("$.items[?(@.code == 'CEILING_PRICE')].loadable").value(false));

        // Missing columns: refused, recorded, nothing changes.
        upload(staff, "PINCODE", "OfficeName,Pincode\nA,600001\n", "2026-11-01", false)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("REFERENCE_FILE_COLUMNS_MISSING"))
                .andExpect(jsonPath("$.missingColumns[0]").value("district"));
        upload(staff, "PINCODE", PINS, "2999-01-01", false)
                .andExpect(jsonPath("$.code").value("REFERENCE_SOURCE_DATE_FUTURE"));
        upload(staff, "HSN", PINS, "2026-11-01", false)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("REFERENCE_DATASET_NOT_LOADABLE"));

        upload(staff, "PINCODE", PINS, "2026-11-01", false)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("LOADED"))
                .andExpect(jsonPath("$.rowsRead").value(5))
                .andExpect(jsonPath("$.rowsLoaded").value(3))
                .andExpect(jsonPath("$.rowsSkipped").value(1))
                .andExpect(jsonPath("$.problems[0].line").value(6));
        upload(staff, "IFSC", IFSC, "2026-11-20", false).andExpect(status().isCreated());

        mvc.perform(get("/api/v1/platform/reference-data").header("Authorization", bearer(staff)))
                .andExpect(jsonPath("$.items[?(@.code == 'PINCODE')].status").value("CURRENT"))
                .andExpect(jsonPath("$.items[?(@.code == 'PINCODE')].rowCount").value(3))
                .andExpect(jsonPath("$.items[?(@.code == 'PINCODE')].loadedByName").value("Test Admin"))
                .andExpect(jsonPath("$.items[?(@.code == 'PINCODE')].sourceDate").value("2026-11-01"));

        // Tenants look up; unknown codes are 404 with a friendly message, malformed ones 400.
        mvc.perform(get("/api/v1/reference/pincodes/600040").header("Authorization", tenant.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stateCode").value("33"))
                .andExpect(jsonPath("$.district").value("Chennai"))
                .andExpect(jsonPath("$.localities[1]").value("Anna Nagar East"));
        mvc.perform(get("/api/v1/reference/pincodes/600099").header("Authorization", tenant.bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("REFERENCE_PINCODE_NOT_FOUND"));
        mvc.perform(get("/api/v1/reference/pincodes/060001").header("Authorization", tenant.bearer()))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/reference/ifsc/test0000001").header("Authorization", tenant.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bank").value("Test Bank"))
                .andExpect(jsonPath("$.address").value("2nd Avenue, Anna Nagar"));
        mvc.perform(get("/api/v1/reference/pincodes/600040")).andExpect(status().isUnauthorized());

        // A file far smaller than today's list is refused unless replaced anyway.
        String one = "OfficeName,Pincode,District,StateName\nConnaught Place H.O,110001,NEW DELHI,DELHI\n";
        upload(staff, "PINCODE", one, "2026-11-02", false)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("REFERENCE_LOAD_SHRINKS"))
                .andExpect(jsonPath("$.rowsToday").value(3));
        mvc.perform(get("/api/v1/reference/pincodes/600040").header("Authorization", tenant.bearer()))
                .andExpect(status().isOk());
        upload(staff, "PINCODE", one, "2026-11-02", true)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.replacedAnyway").value(true));
        mvc.perform(get("/api/v1/reference/pincodes/600040").header("Authorization", tenant.bearer()))
                .andExpect(status().isNotFound());

        // History keeps every attempt, newest first, refused ones with their reason.
        mvc.perform(get("/api/v1/platform/reference-data/PINCODE/loads").header("Authorization", bearer(staff)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(4))
                .andExpect(jsonPath("$.items[0].status").value("LOADED"))
                .andExpect(jsonPath("$.items[1].reasonCode").value("REFERENCE_LOAD_SHRINKS"))
                .andExpect(jsonPath("$.items[3].reasonCode").value("REFERENCE_FILE_COLUMNS_MISSING"))
                .andExpect(jsonPath("$.items[0].loadedByName").value("Test Admin"));
        mvc.perform(get("/api/v1/platform/reference-data/NOPE/loads").header("Authorization", bearer(staff)))
                .andExpect(status().isNotFound());
    }

    @Test
    void viewOnlyStaffSeeTheListsButCannotLoad() throws Exception {
        String email = "viewer-" + UUID.randomUUID() + "@platform.test";
        staffWith(email, "platform.reference.view");
        String viewer = login(email, "staff-pass-12345");

        mvc.perform(get("/api/v1/platform/reference-data").header("Authorization", bearer(viewer)))
                .andExpect(status().isOk());
        upload(viewer, "PINCODE", PINS, "2026-11-01", false)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("COMMON_PERMISSION_DENIED"));
    }

    private void staffWith(String email, String permission) {
        UUID id = UUID.randomUUID();
        admin.jdbc().update("""
                insert into platform_user (id, email, full_name, password_hash, created_at, updated_at)
                values (?, ?, 'Staff', ?, now(), now())""", id, email, passwordEncoder.encode("staff-pass-12345"));
        admin.jdbc().update("insert into platform_user_permission (user_id, permission_code) values (?, ?)", id,
                permission);
    }

    private ResultActions loginRaw(String email, String password) throws Exception {
        return mvc.perform(post("/api/v1/platform/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)));
    }

    private String login(String email, String password) throws Exception {
        String json = loginRaw(email, password).andExpect(status().isOk())
                .andExpect(jsonPath("$.staff.email").value(email))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$.accessToken");
    }

    private ResultActions upload(String token, String code, String csv, String sourceDate, boolean anyway)
            throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "list.csv", "text/csv",
                csv.getBytes(StandardCharsets.UTF_8));
        return mvc.perform(multipart("/api/v1/platform/reference-data/{code}/loads", code).file(file)
                .param("sourceDate", sourceDate).param("replaceAnyway", String.valueOf(anyway))
                .header("Authorization", bearer(token)));
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }
}
