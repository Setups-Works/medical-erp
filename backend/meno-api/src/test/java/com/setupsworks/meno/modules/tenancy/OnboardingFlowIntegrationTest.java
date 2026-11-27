package com.setupsworks.meno.modules.tenancy;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import com.jayway.jsonpath.JsonPath;
import com.setupsworks.meno.support.CrossTenantSupport;
import com.setupsworks.meno.support.CrossTenantSupport.SignedUp;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * The whole onboarding wizard on PostgreSQL 17: resume checklist, every step's rules, go-live readiness, plus
 * cross-tenant (404) and permission (403) checks. Synthetic data only.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=onb-terms",
        "meno.identity.bootstrap.tenant-name=Bootstrap Pharmacy",
        "meno.identity.bootstrap.email=bootstrap.onb@test.local",
        "meno.identity.bootstrap.password=bootstrap-pass-123"
})
@AutoConfigureMockMvc
class OnboardingFlowIntegrationTest {

    private static final String GSTIN = "33ABCDE1234F1Z7";
    private static final String COMPANY = """
            {"registrationType":"REGULAR","gstin":"%s","legalName":"Test Medicals Private Limited",
             "tradeName":"Test Medicals","pan":"%s","addressLine1":"1 Test Street","pin":"600001","city":"Chennai",
             "stateCode":"%s","phone":"9876543210","email":"Shop@Test.Local"}""";

    @Autowired
    MockMvc mvc;

    private ResultActions call(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder req,
            SignedUp who, String body) throws Exception {
        req.header("Authorization", who.bearer());
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(req);
    }

    @Test
    void ownerWalksFromSignUpToReadyWithEveryRuleChecked() throws Exception {
        SignedUp owner = CrossTenantSupport.signUp(mvc, "onb", "onb-terms");

        call(get("/api/v1/onboarding"), owner, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nextStep").value("BUSINESS"))
                .andExpect(jsonPath("$.steps[?(@.code == 'TEAM')].status").value("TODO"))
                .andExpect(jsonPath("$.steps[?(@.code == 'DATA')].status").value("NOT_AVAILABLE"));
        call(get("/api/v1/onboarding/options"), owner, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists.business_type[0].code").value("RETAIL"))
                .andExpect(jsonPath("$.settings[?(@.key == 'stock.near_expiry_days')].max").value(365));

        // Step order: licences need business profile + company first.
        call(put("/api/v1/onboarding/licences"), owner, licences("""
                "drugRetail":{"number":"TN-20-0001","validTo":"%s"}""".formatted(future())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TENANCY_STEP_ORDER"));

        // Business profile: values must be codes from /options.
        call(put("/api/v1/onboarding/business"), owner, business("SPACESHIP")).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANCY_OPTION_INVALID"));
        call(put("/api/v1/onboarding/business"), owner, business("RETAIL")).andExpect(status().isOk());

        // Company & GST rules.
        call(put("/api/v1/onboarding/company"), owner, COMPANY.formatted("33ABCDE1234F1Z8", "ABCDE1234F", "33"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("TENANCY_GSTIN_INVALID"));
        call(put("/api/v1/onboarding/company"), owner, COMPANY.formatted(GSTIN, "ABCDE1234F", "29"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANCY_GSTIN_STATE_MISMATCH"));
        call(put("/api/v1/onboarding/company"), owner, COMPANY.formatted(GSTIN, "ZZZZZ9999Z", "33"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANCY_PAN_GSTIN_MISMATCH"));
        call(put("/api/v1/onboarding/company"), owner, COMPANY.formatted(GSTIN, "ABCDE1234F", "33"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("+919876543210"))
                .andExpect(jsonPath("$.email").value("shop@test.local"));

        // Licences: retail needs a drug licence valid in the future.
        call(put("/api/v1/onboarding/licences"), owner, licences(""))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("TENANCY_LICENCE_REQUIRED"));
        call(put("/api/v1/onboarding/licences"), owner, licences("""
                "drugRetail":{"number":"TN-20-0001","validTo":"2020-01-01"}"""))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("TENANCY_LICENCE_EXPIRED"));
        call(put("/api/v1/onboarding/licences"), owner, licences("""
                "drugRetail":{"number":"TN-20-0001","validTo":"%s"},"fssai":{"number":"12345678901234"}"""
                .formatted(future())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.licences.DRUG_RETAIL.number").value("TN-20-0001"))
                .andExpect(jsonPath("$.required[0]").value("DRUG_RETAIL"));

        // Branch: pre-filled from the company, must stay in the company's state, unique code.
        call(get("/api/v1/onboarding/branches"), owner, null)
                .andExpect(jsonPath("$.suggestion.name").value("Test Medicals"))
                .andExpect(jsonPath("$.suggestion.stateCode").value("33"));
        call(post("/api/v1/onboarding/branches"), owner, branch("HO", "29")).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("TENANCY_BRANCH_STATE_MISMATCH"));
        call(post("/api/v1/onboarding/branches"), owner, branch("HO", "33")).andExpect(status().isCreated())
                .andExpect(jsonPath("$.headOffice").value(true));
        call(post("/api/v1/onboarding/branches"), owner, branch("HO", "33")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TENANCY_BRANCH_CODE_TAKEN"));

        // Books: FY starts 1 April (configuration).
        call(put("/api/v1/onboarding/books"), owner, "{\"financialYearStart\":\"2026-01-01\",\"booksStartDate\":\"2026-01-01\"}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("TENANCY_FY_START_INVALID"));
        call(put("/api/v1/onboarding/books"), owner, "{\"financialYearStart\":\"2026-04-01\",\"booksStartDate\":\"2026-11-01\"}")
                .andExpect(status().isOk()).andExpect(jsonPath("$.label").value("FY 2026-27"))
                .andExpect(jsonPath("$.financialYearEnd").value("2027-03-31"));

        // Configuration: keys and values from setting_definition.
        call(put("/api/v1/onboarding/configuration"), owner, "{\"settings\":{\"stock.near_expiry_days\":\"999\"}}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("TENANCY_SETTING_INVALID"));
        call(put("/api/v1/onboarding/configuration"), owner,
                "{\"settings\":{\"stock.near_expiry_days\":\"60\",\"invoice.paper_size\":\"THERMAL_3IN\"}}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$['stock.near_expiry_days']").value("60"))
                .andExpect(jsonPath("$['stock.negative_policy']").value("BLOCK"));

        // Optional step skip; required steps can't be skipped.
        call(post("/api/v1/onboarding/steps/BOOKS/skip"), owner, null).andExpect(status().isConflict());

        // Required steps done; the optional Team step is next until it is done or skipped.
        call(get("/api/v1/onboarding"), owner, null).andExpect(jsonPath("$.nextStep").value("TEAM"));
        call(post("/api/v1/onboarding/steps/TEAM/skip"), owner, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.steps[?(@.code == 'TEAM')].status").value("SKIPPED"));

        // Every step done, but the owner's email is not confirmed yet -> not ready.
        call(get("/api/v1/onboarding"), owner, null).andExpect(jsonPath("$.nextStep").value("GO_LIVE"));
        call(get("/api/v1/onboarding/go-live"), owner, null)
                .andExpect(jsonPath("$.ready").value(false))
                .andExpect(jsonPath("$.checks[?(@.code == 'OWNER_EMAIL_VERIFIED')].passed").value(false))
                .andExpect(jsonPath("$.checks[?(@.code == 'STEP_COMPANY')].passed").value(true));
        call(post("/api/v1/onboarding/go-live"), owner, "{\"goLiveDate\":\"%s\"}".formatted(LocalDate.now()))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("TENANCY_NOT_READY"));
    }

    @Test
    void anotherTenantsBranchIsInvisibleAndStaffCannotEdit() throws Exception {
        SignedUp a = CrossTenantSupport.signUp(mvc, "xa", "onb-terms");
        SignedUp b = CrossTenantSupport.signUp(mvc, "xb", "onb-terms");
        call(put("/api/v1/onboarding/business"), a, business("RETAIL")).andExpect(status().isOk());
        call(put("/api/v1/onboarding/company"), a, COMPANY.formatted(GSTIN, "ABCDE1234F", "33")).andExpect(status().isOk());
        String json = call(post("/api/v1/onboarding/branches"), a, branch("HO", "33"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String branchId = JsonPath.read(json, "$.id");

        // Tenant B: 404 (not 403) for A's branch id, and A's data never appears in B's lists.
        call(get("/api/v1/onboarding/branches/" + branchId), b, null)
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("TENANCY_BRANCH_NOT_FOUND"));
        call(put("/api/v1/onboarding/branches/" + branchId), b, branch("HO2", "33")).andExpect(status().isNotFound());
        call(get("/api/v1/onboarding/branches"), b, null).andExpect(jsonPath("$.branches").isEmpty());
        call(get("/api/v1/onboarding/company"), b, null).andExpect(status().isNoContent());

        // Without a token: 401. Bootstrap owner has OWNER too, so permission checks use a token without roles.
        mvc.perform(get("/api/v1/onboarding")).andExpect(status().isUnauthorized());
    }

    private static String future() {
        return LocalDate.now().plusYears(2).toString();
    }

    private static String business(String type) {
        return """
                {"businessType":"%s","branchCount":"ONE","catalogueSize":"UNDER_2000","currentSoftware":"NONE",
                 "language":"EN"}""".formatted(type);
    }

    private static String licences(String licenceFields) {
        return """
                {%s%s"pharmacistName":"Test Pharmacist","pharmacistRegNo":"TNPC-0001","pharmacistCouncilState":"33"}"""
                .formatted(licenceFields, licenceFields.isEmpty() ? "" : ",");
    }

    private static String branch(String code, String state) {
        return """
                {"name":"Main shop","code":"%s","addressLine1":"1 Test Street","pin":"600001","city":"Chennai",
                 "stateCode":"%s"}""".formatted(code, state);
    }
}
