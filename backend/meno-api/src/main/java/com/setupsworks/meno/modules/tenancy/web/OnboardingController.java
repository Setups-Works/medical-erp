package com.setupsworks.meno.modules.tenancy.web;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

import com.setupsworks.meno.modules.tenancy.domain.Branch;
import com.setupsworks.meno.modules.tenancy.domain.Company;
import com.setupsworks.meno.modules.tenancy.domain.Licence;
import com.setupsworks.meno.modules.tenancy.domain.Tenant;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService.Books;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService.BranchView;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService.Branches;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService.Checklist;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService.LicenceEntry;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService.Licences;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService.Options;
import com.setupsworks.meno.modules.tenancy.service.OnboardingService.Readiness;
import com.setupsworks.meno.security.PermissionChecker;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Onboarding wizard API (docs/product/ONBOARDING.md, PAGES.md §A). The tenant always comes from the token.
 * Reads need {@code tenancy.onboarding.view}, writes {@code tenancy.onboarding.manage}. Errors: Problem Details
 * with TENANCY_* codes (module AGENTS.md); field formats follow VALIDATION_AND_BUSINESS_RULES.md §4.
 */
@RestController
@RequestMapping(path = "/api/v1/onboarding", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Onboarding", description = "Set-up steps from sign-up to go-live; resume anywhere.")
class OnboardingController {

    private static final String VIEW = "tenancy.onboarding.view";
    private static final String MANAGE = "tenancy.onboarding.manage";
    private static final String NO_CONTROL = "[^\\p{Cntrl}]*";
    private static final String PIN = "[1-9][0-9]{5}";
    private static final String STATE = "[0-9]{2}";

    private final OnboardingService onboarding;
    private final PermissionChecker permissions;

    OnboardingController(OnboardingService onboarding, PermissionChecker permissions) {
        this.onboarding = onboarding;
        this.permissions = permissions;
    }

    @Operation(summary = "Checklist: every step with its status and the next step to resume")
    @GetMapping
    Checklist checklist() {
        permissions.require(VIEW);
        return onboarding.checklist();
    }

    @Operation(summary = "Option lists, setting definitions and states for all onboarding screens")
    @GetMapping("/options")
    Options options() {
        permissions.require(VIEW);
        return onboarding.options();
    }

    @Operation(summary = "Skip an optional step (team, data, devices, plan, practice)")
    @ApiResponse(responseCode = "409", description = "TENANCY_STEP_REQUIRED, TENANCY_ALREADY_LIVE")
    @PostMapping("/steps/{step}/skip")
    Checklist skip(@PathVariable String step) {
        permissions.require(MANAGE);
        return onboarding.skip(step);
    }

    // ---- business profile (AUT-05)

    @GetMapping("/business")
    Tenant.BusinessProfile business() {
        permissions.require(VIEW);
        return onboarding.business();
    }

    @Operation(summary = "Save the business profile", description = "Every value must be a code from /options.")
    @ApiResponse(responseCode = "400", description = "TENANCY_OPTION_INVALID")
    @PutMapping("/business")
    Tenant.BusinessProfile saveBusiness(@Valid @RequestBody BusinessRequest r) {
        permissions.require(MANAGE);
        return onboarding.saveBusiness(new Tenant.BusinessProfile(r.businessType(), r.branchCount(),
                r.catalogueSize(), r.currentSoftware(), r.language()));
    }

    record BusinessRequest(@NotBlank @Size(max = 50) String businessType, @NotBlank @Size(max = 50) String branchCount,
            @NotBlank @Size(max = 50) String catalogueSize, @NotBlank @Size(max = 50) String currentSoftware,
            @NotBlank @Size(max = 50) String language) {
    }

    // ---- company & GST (AUT-06)

    @ApiResponse(responseCode = "204", description = "Not filled in yet")
    @GetMapping("/company")
    ResponseEntity<Company.Details> company() {
        permissions.require(VIEW);
        return onboarding.company().map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @Operation(summary = "Save company & GST", description = "GSTIN check character, state = GSTIN state, "
            + "PAN = GSTIN chars 3–12. GSTIN fetch (PTY-15) is a separate endpoint later.")
    @ApiResponse(responseCode = "400", description = "TENANCY_GSTIN_INVALID, TENANCY_GSTIN_STATE_MISMATCH, "
            + "TENANCY_PAN_GSTIN_MISMATCH, TENANCY_GSTIN_REQUIRED, TENANCY_GSTIN_NOT_ALLOWED, TENANCY_STATE_UNKNOWN")
    @PutMapping("/company")
    Company.Details saveCompany(@Valid @RequestBody CompanyRequest r) {
        permissions.require(MANAGE);
        return onboarding.saveCompany(new Company.Details(r.registrationType(), blankToNull(r.gstin()),
                r.legalName().trim(), blankToNull(r.tradeName()), r.pan(), r.addressLine1().trim(),
                blankToNull(r.addressLine2()), r.pin(), r.city().trim(), blankToNull(r.district()), r.stateCode(),
                r.phone() == null || r.phone().isBlank() ? null : "+91" + r.phone(),
                r.email() == null || r.email().isBlank() ? null
                        : r.email().trim().toLowerCase(java.util.Locale.ROOT)));
    }

    record CompanyRequest(
            @NotBlank @Size(max = 50) String registrationType,
            @Pattern(regexp = "|[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]", message = "is not a GSTIN")
            String gstin,
            @NotBlank @Size(max = 200) @Pattern(regexp = NO_CONTROL) String legalName,
            @Size(max = 200) @Pattern(regexp = NO_CONTROL) String tradeName,
            @NotBlank @Pattern(regexp = "[A-Z]{5}[0-9]{4}[A-Z]", message = "is not a PAN") String pan,
            @NotBlank @Size(max = 200) @Pattern(regexp = NO_CONTROL) String addressLine1,
            @Size(max = 200) @Pattern(regexp = NO_CONTROL) String addressLine2,
            @NotBlank @Pattern(regexp = PIN, message = "must be 6 digits, not starting with 0") String pin,
            @NotBlank @Size(max = 100) @Pattern(regexp = NO_CONTROL) String city,
            @Size(max = 100) @Pattern(regexp = NO_CONTROL) String district,
            @NotBlank @Pattern(regexp = STATE) String stateCode,
            @Pattern(regexp = "|[6-9][0-9]{9}", message = "must be 10 digits starting with 6-9") String phone,
            @Email @Size(max = 254) String email) {
    }

    // ---- licences & pharmacist (AUT-07)

    @GetMapping("/licences")
    Licences licences() {
        permissions.require(VIEW);
        return onboarding.licences();
    }

    @Operation(summary = "Save licences and the pharmacist in charge",
            description = "Which drug licences are required depends on the business type (seeded rule table). "
                    + "Drug licences need an expiry in the future. Scans come with the files module.")
    @ApiResponse(responseCode = "400", description = "TENANCY_LICENCE_REQUIRED, TENANCY_LICENCE_EXPIRY_REQUIRED, "
            + "TENANCY_LICENCE_EXPIRED, TENANCY_FSSAI_INVALID")
    @ApiResponse(responseCode = "409", description = "TENANCY_STEP_ORDER (business profile and company first)")
    @PutMapping("/licences")
    Licences saveLicences(@Valid @RequestBody LicencesRequest r) {
        permissions.require(MANAGE);
        Map<Licence.Kind, LicenceEntry> map = new EnumMap<>(Licence.Kind.class);
        put(map, Licence.Kind.DRUG_RETAIL, r.drugRetail());
        put(map, Licence.Kind.DRUG_WHOLESALE, r.drugWholesale());
        put(map, Licence.Kind.FSSAI, r.fssai());
        put(map, Licence.Kind.NARCOTIC, r.narcotic());
        return onboarding.saveLicences(new Licences(map, r.pharmacistName().trim(), r.pharmacistRegNo().trim(),
                r.pharmacistCouncilState(), java.util.Set.of()));
    }

    private static void put(Map<Licence.Kind, LicenceEntry> map, Licence.Kind kind, LicenceRequest r) {
        if (r != null) {
            map.put(kind, new LicenceEntry(r.number(), r.validTo()));
        }
    }

    record LicenceRequest(@NotBlank @Size(min = 3, max = 40) @Pattern(regexp = NO_CONTROL) String number,
            LocalDate validTo) {
    }

    record LicencesRequest(@Valid LicenceRequest drugRetail, @Valid LicenceRequest drugWholesale,
            @Valid LicenceRequest fssai, @Valid LicenceRequest narcotic,
            @NotBlank @Size(max = 200) @Pattern(regexp = NO_CONTROL) String pharmacistName,
            @NotBlank @Size(min = 3, max = 40) @Pattern(regexp = NO_CONTROL) String pharmacistRegNo,
            @NotBlank @Pattern(regexp = STATE) String pharmacistCouncilState) {
    }

    // ---- branches (PLT-03)

    @Operation(summary = "Branches, plus a suggestion pre-filled from the company address when there are none")
    @GetMapping("/branches")
    Branches branches() {
        permissions.require(VIEW);
        return onboarding.branches();
    }

    @ApiResponse(responseCode = "404", description = "TENANCY_BRANCH_NOT_FOUND (also for another tenant's id)")
    @GetMapping("/branches/{id}")
    BranchView branch(@PathVariable UUID id) {
        permissions.require(VIEW);
        return onboarding.branch(id);
    }

    @Operation(summary = "Add a branch", description = "The first branch becomes the head office.")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "TENANCY_BRANCH_STATE_MISMATCH")
    @ApiResponse(responseCode = "409", description = "TENANCY_BRANCH_CODE_TAKEN, TENANCY_STEP_ORDER")
    @PostMapping("/branches")
    ResponseEntity<BranchView> createBranch(@Valid @RequestBody BranchRequest r) {
        permissions.require(MANAGE);
        return ResponseEntity.status(HttpStatus.CREATED).body(onboarding.createBranch(r.toDetails()));
    }

    @PutMapping("/branches/{id}")
    BranchView updateBranch(@PathVariable UUID id, @Valid @RequestBody BranchRequest r) {
        permissions.require(MANAGE);
        return onboarding.updateBranch(id, r.toDetails());
    }

    record BranchRequest(
            @NotBlank @Size(max = 100) @Pattern(regexp = NO_CONTROL) String name,
            @NotBlank @Pattern(regexp = "[A-Z0-9]{1,10}", message = "1-10 capital letters or digits") String code,
            @NotBlank @Size(max = 200) @Pattern(regexp = NO_CONTROL) String addressLine1,
            @Size(max = 200) @Pattern(regexp = NO_CONTROL) String addressLine2,
            @NotBlank @Pattern(regexp = PIN) String pin,
            @NotBlank @Size(max = 100) @Pattern(regexp = NO_CONTROL) String city,
            @Size(max = 100) @Pattern(regexp = NO_CONTROL) String district,
            @NotBlank @Pattern(regexp = STATE) String stateCode) {

        Branch.Details toDetails() {
            return new Branch.Details(name.trim(), code, addressLine1.trim(), blankToNull(addressLine2), pin,
                    city.trim(), blankToNull(district), stateCode);
        }
    }

    // ---- books (financial year)

    @ApiResponse(responseCode = "204", description = "Not filled in yet")
    @GetMapping("/books")
    ResponseEntity<Books> books() {
        permissions.require(VIEW);
        return onboarding.books().map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @Operation(summary = "Save the financial year and books start date",
            description = "The FY starts on day 1 of the configured month (April by default) and lasts a year.")
    @ApiResponse(responseCode = "400", description = "TENANCY_FY_START_INVALID, TENANCY_BOOKS_START_OUTSIDE_FY")
    @PutMapping("/books")
    Books saveBooks(@Valid @RequestBody BooksRequest r) {
        permissions.require(MANAGE);
        return onboarding.saveBooks(r.financialYearStart(), r.booksStartDate());
    }

    record BooksRequest(@NotNull LocalDate financialYearStart, @NotNull LocalDate booksStartDate) {
    }

    // ---- billing preferences (AUT-02 subset)

    @Operation(summary = "Tenant settings with defaults filled in")
    @GetMapping("/configuration")
    Map<String, String> configuration() {
        permissions.require(VIEW);
        return onboarding.configuration();
    }

    @Operation(summary = "Save billing / stock preferences", description = "Keys and allowed values from /options.")
    @ApiResponse(responseCode = "400", description = "TENANCY_SETTING_UNKNOWN, TENANCY_SETTING_INVALID")
    @PutMapping("/configuration")
    Map<String, String> saveConfiguration(@Valid @RequestBody ConfigurationRequest r) {
        permissions.require(MANAGE);
        return onboarding.saveConfiguration(r.settings());
    }

    record ConfigurationRequest(
            @NotNull Map<@NotBlank @Size(max = 100) String, @NotNull @Size(max = 100) String> settings) {
    }

    // ---- go-live (AUT-13)

    @Operation(summary = "Readiness checks and the allowed go-live date range")
    @GetMapping("/go-live")
    Readiness readiness() {
        permissions.require(VIEW);
        return onboarding.readiness();
    }

    @Operation(summary = "Go live", description = "All checks must pass; date between books start and today + N days.")
    @ApiResponse(responseCode = "409", description = "TENANCY_NOT_READY, TENANCY_ALREADY_LIVE")
    @ApiResponse(responseCode = "400", description = "TENANCY_GO_LIVE_DATE_INVALID")
    @PostMapping("/go-live")
    Readiness goLive(@Valid @RequestBody GoLiveRequest r) {
        permissions.require(MANAGE);
        return onboarding.goLive(r.goLiveDate());
    }

    record GoLiveRequest(@NotNull LocalDate goLiveDate) {
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
