package com.setupsworks.meno.modules.tenancy.service;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.tenancy.api.GoLiveCheck;
import com.setupsworks.meno.modules.tenancy.api.TenantWentLive;
import com.setupsworks.meno.modules.tenancy.domain.Branch;
import com.setupsworks.meno.modules.tenancy.domain.Company;
import com.setupsworks.meno.modules.tenancy.domain.FinancialYear;
import com.setupsworks.meno.modules.tenancy.domain.Gstin;
import com.setupsworks.meno.modules.tenancy.domain.Licence;
import com.setupsworks.meno.modules.tenancy.domain.ReferenceData;
import com.setupsworks.meno.modules.tenancy.domain.Tenant;
import com.setupsworks.meno.modules.tenancy.domain.TenantRows;
import com.setupsworks.meno.modules.tenancy.repository.BranchRepository;
import com.setupsworks.meno.modules.tenancy.repository.BusinessTypeLicenceRepository;
import com.setupsworks.meno.modules.tenancy.repository.CompanyRepository;
import com.setupsworks.meno.modules.tenancy.repository.FinancialYearRepository;
import com.setupsworks.meno.modules.tenancy.repository.LicenceRepository;
import com.setupsworks.meno.modules.tenancy.repository.LookupOptionRepository;
import com.setupsworks.meno.modules.tenancy.repository.OnboardingProgressRepository;
import com.setupsworks.meno.modules.tenancy.repository.OnboardingStepRepository;
import com.setupsworks.meno.modules.tenancy.repository.RegistrationTypeRuleRepository;
import com.setupsworks.meno.modules.tenancy.repository.SettingDefinitionRepository;
import com.setupsworks.meno.modules.tenancy.repository.TenantRepository;
import com.setupsworks.meno.modules.tenancy.repository.TenantSettingRepository;
import com.setupsworks.meno.security.TenantContext;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Onboarding steps (docs/product/ONBOARDING.md). Each step saves on "Next" and marks its progress row, so the
 * owner can resume anywhere (AUT-15). Field formats are checked by Bean Validation in the controller; this class
 * owns the rules that need data (options, states, licences per business type) or other steps.
 * After go-live the steps are read-only here; later changes go through Settings (with audit).
 */
@Service
public class OnboardingService {

    public static final String DONE = "DONE";
    public static final String SKIPPED = "SKIPPED";

    private final TenantRepository tenants;
    private final CompanyRepository companies;
    private final LicenceRepository licences;
    private final BranchRepository branches;
    private final FinancialYearRepository financialYears;
    private final TenantSettingRepository settings;
    private final OnboardingProgressRepository progress;
    private final LookupOptionRepository options;
    private final BusinessTypeLicenceRepository businessTypeLicences;
    private final RegistrationTypeRuleRepository registrationTypes;
    private final SettingDefinitionRepository settingDefinitions;
    private final OnboardingStepRepository steps;
    private final TenantService tenantService;
    private final List<GoLiveCheck> goLiveChecks;
    private final ApplicationEventPublisher events;
    private final OnboardingProperties properties;
    private final Clock clock;

    OnboardingService(TenantRepository tenants, CompanyRepository companies, LicenceRepository licences,
            BranchRepository branches, FinancialYearRepository financialYears, TenantSettingRepository settings,
            OnboardingProgressRepository progress, LookupOptionRepository options,
            BusinessTypeLicenceRepository businessTypeLicences, RegistrationTypeRuleRepository registrationTypes,
            SettingDefinitionRepository settingDefinitions, OnboardingStepRepository steps,
            TenantService tenantService, List<GoLiveCheck> goLiveChecks, ApplicationEventPublisher events,
            OnboardingProperties properties, Clock clock) {
        this.tenants = tenants;
        this.companies = companies;
        this.licences = licences;
        this.branches = branches;
        this.financialYears = financialYears;
        this.settings = settings;
        this.progress = progress;
        this.options = options;
        this.businessTypeLicences = businessTypeLicences;
        this.registrationTypes = registrationTypes;
        this.settingDefinitions = settingDefinitions;
        this.steps = steps;
        this.tenantService = tenantService;
        this.goLiveChecks = goLiveChecks;
        this.events = events;
        this.properties = properties;
        this.clock = clock;
    }

    // ---------------------------------------------------------------- options + checklist

    public record Option(String code, String label) {
    }

    public record SettingInfo(String key, String type, String listCode, String defaultValue, Integer min, Integer max) {
    }

    public record StateInfo(String code, String name) {
    }

    public record Options(Map<String, List<Option>> lists, List<SettingInfo> settings, List<StateInfo> states,
            int financialYearStartMonth) {
    }

    @Transactional(readOnly = true)
    public Options options() {
        Map<String, List<Option>> lists = new LinkedHashMap<>();
        options.findByActiveTrueOrderByListCodeAscSortOrderAsc().forEach(o ->
                lists.computeIfAbsent(o.getListCode(), k -> new ArrayList<>()).add(new Option(o.getCode(), o.getLabel())));
        List<SettingInfo> defs = settingDefinitions.findAllByOrderBySortOrderAsc().stream()
                .map(d -> new SettingInfo(d.getKey(), d.getValueType(), d.getListCode(), d.getDefaultValue(),
                        d.getMinValue(), d.getMaxValue()))
                .toList();
        List<StateInfo> states = tenantService.activeStates().stream()
                .map(s -> new StateInfo(s.code(), s.name())).toList();
        return new Options(lists, defs, states, properties.financialYearStartMonth());
    }

    public record StepStatus(String code, String route, boolean required, boolean available, String phase,
            String status) {
    }

    public record Checklist(List<StepStatus> steps, String nextStep, boolean live, LocalDate goLiveDate) {
    }

    @Transactional(readOnly = true)
    public Checklist checklist() {
        UUID tenantId = TenantContext.requireTenantId();
        Tenant tenant = tenant(tenantId);
        Map<String, String> done = progress.findByTenantId(tenantId).stream()
                .collect(Collectors.toMap(TenantRows.OnboardingProgress::getStep,
                        TenantRows.OnboardingProgress::getStatus));
        List<StepStatus> list = steps.findAllByOrderBySortOrderAsc().stream()
                .map(s -> new StepStatus(s.getCode(), s.getRoute(), s.isRequired(), s.isAvailable(), s.getPhase(),
                        !s.isAvailable() ? "NOT_AVAILABLE" : done.getOrDefault(s.getCode(), "TODO")))
                .toList();
        String next = tenant.isLive() ? null : list.stream()
                .filter(s -> s.available() && "TODO".equals(s.status()))
                .map(StepStatus::code).findFirst().orElse("GO_LIVE");
        return new Checklist(list, next, tenant.isLive(), tenant.getGoLiveDate());
    }

    @Transactional
    public Checklist skip(String step) {
        UUID tenantId = editableTenant().getId();
        ReferenceData.OnboardingStep def = steps.findById(step).orElseThrow(() -> new MenoException(
                HttpStatus.NOT_FOUND, "TENANCY_STEP_UNKNOWN", "Unknown onboarding step."));
        if (def.isRequired()) {
            throw new MenoException(HttpStatus.CONFLICT, "TENANCY_STEP_REQUIRED", "This step can't be skipped.");
        }
        mark(tenantId, step, SKIPPED);
        return checklist();
    }

    // ---------------------------------------------------------------- business profile (AUT-05)

    @Transactional(readOnly = true)
    public Tenant.BusinessProfile business() {
        return tenant(TenantContext.requireTenantId()).businessProfile();
    }

    @Transactional
    public Tenant.BusinessProfile saveBusiness(Tenant.BusinessProfile profile) {
        Tenant tenant = editableTenant();
        requireOption("business_type", profile.businessType(), "businessType");
        requireOption("branch_count", profile.branchCount(), "branchCount");
        requireOption("catalogue_size", profile.catalogueSize(), "catalogueSize");
        requireOption("current_software", profile.currentSoftware(), "currentSoftware");
        requireOption("language", profile.language(), "language");
        tenant.updateBusinessProfile(profile, clock.instant());
        mark(tenant.getId(), "BUSINESS", DONE);
        return tenant.businessProfile();
    }

    // ---------------------------------------------------------------- company & GST (AUT-06)

    @Transactional(readOnly = true)
    public Optional<Company.Details> company() {
        return companies.findFirstByTenantIdAndPrimaryTrue(TenantContext.requireTenantId()).map(Company::details);
    }

    @Transactional
    public Company.Details saveCompany(Company.Details d) {
        Tenant tenant = editableTenant();
        requireOption("registration_type", d.registrationType(), "registrationType");
        boolean gstinRequired = registrationTypes.findById(d.registrationType())
                .map(ReferenceData.RegistrationTypeRule::isGstinRequired).orElse(true);
        if (!tenantService.isActiveState(d.stateCode())) {
            throw invalid("TENANCY_STATE_UNKNOWN", "Choose your state.");
        }
        if (gstinRequired && d.gstin() == null) {
            throw invalid("TENANCY_GSTIN_REQUIRED", "Enter the GSTIN for a registered business.");
        }
        if (!gstinRequired && d.gstin() != null) {
            throw invalid("TENANCY_GSTIN_NOT_ALLOWED", "Remove the GSTIN or choose a registered type.");
        }
        if (d.gstin() != null) {
            if (!Gstin.hasValidCheckCharacter(d.gstin())) {
                throw invalid("TENANCY_GSTIN_INVALID", "This GSTIN is not valid. Check it on the GST certificate.");
            }
            // The most common set-up mistake (ONBOARDING.md): the state must be the GSTIN's state.
            if (!Gstin.stateCode(d.gstin()).equals(d.stateCode())) {
                throw invalid("TENANCY_GSTIN_STATE_MISMATCH", "The state must match the GSTIN (first two digits).");
            }
            if (!Gstin.pan(d.gstin()).equals(d.pan())) {
                throw invalid("TENANCY_PAN_GSTIN_MISMATCH", "PAN must match characters 3–12 of the GSTIN.");
            }
        }
        Instant now = clock.instant();
        UUID by = TenantContext.userId().orElse(null);
        Company company = companies.findFirstByTenantIdAndPrimaryTrue(tenant.getId())
                .orElseGet(() -> Company.primary(tenant.getId(), by, now));
        company.update(d);
        company.touched(by, now);
        companies.save(company);
        mark(tenant.getId(), "COMPANY", DONE);
        return company.details();
    }

    // ---------------------------------------------------------------- licences & pharmacist (AUT-07)

    public record LicenceEntry(String number, LocalDate validTo) {
    }

    public record Licences(Map<Licence.Kind, LicenceEntry> licences, String pharmacistName, String pharmacistRegNo,
            String pharmacistCouncilState, Set<Licence.Kind> required) {
    }

    @Transactional(readOnly = true)
    public Licences licences() {
        UUID tenantId = TenantContext.requireTenantId();
        Set<Licence.Kind> required = requiredLicences(tenant(tenantId));
        return companies.findFirstByTenantIdAndPrimaryTrue(tenantId)
                .map(c -> new Licences(licenceMap(tenantId, c.getId()), c.getPharmacistName(), c.getPharmacistRegNo(),
                        c.getPharmacistCouncilState(), required))
                .orElse(new Licences(Map.of(), null, null, null, required));
    }

    @Transactional
    public Licences saveLicences(Licences input) {
        Tenant tenant = editableTenant();
        Company company = companyOrStepOrder(tenant.getId());
        if (tenant.getBusinessType() == null) {
            throw stepOrder("Complete the business profile first.");
        }
        LocalDate today = LocalDate.now(clock);
        for (Licence.Kind kind : requiredLicences(tenant)) {
            if (!input.licences().containsKey(kind)) {
                throw invalid("TENANCY_LICENCE_REQUIRED", "Enter the " + label(kind) + " for this business type.");
            }
        }
        for (var e : input.licences().entrySet()) {
            boolean drug = e.getKey() == Licence.Kind.DRUG_RETAIL || e.getKey() == Licence.Kind.DRUG_WHOLESALE;
            LocalDate validTo = e.getValue().validTo();
            if (drug && validTo == null) {
                throw invalid("TENANCY_LICENCE_EXPIRY_REQUIRED", "Enter the expiry date of the " + label(e.getKey()) + ".");
            }
            if (validTo != null && !validTo.isAfter(today)) {
                throw invalid("TENANCY_LICENCE_EXPIRED", "The " + label(e.getKey()) + " has expired. Renew it first.");
            }
            if (e.getKey() == Licence.Kind.FSSAI && !e.getValue().number().matches("[0-9]{14}")) {
                throw invalid("TENANCY_FSSAI_INVALID", "FSSAI licence number has 14 digits.");
            }
        }
        if (input.pharmacistCouncilState() != null && !tenantService.isActiveState(input.pharmacistCouncilState())) {
            throw invalid("TENANCY_STATE_UNKNOWN", "Choose the pharmacy council's state.");
        }
        Instant now = clock.instant();
        UUID by = TenantContext.userId().orElse(null);
        Map<Licence.Kind, Licence> existing = licences
                .findByTenantIdAndCompanyIdAndBranchIdIsNull(tenant.getId(), company.getId()).stream()
                .collect(Collectors.toMap(Licence::getKind, Function.identity()));
        for (Licence.Kind kind : Licence.Kind.values()) {
            LicenceEntry entry = input.licences().get(kind);
            Licence row = existing.get(kind);
            if (entry == null) {
                if (row != null) {
                    licences.delete(row);
                }
                continue;
            }
            if (row == null) {
                row = Licence.of(tenant.getId(), company.getId(), kind, by, now);
            }
            row.update(entry.number().trim(), entry.validTo());
            row.touched(by, now);
            licences.save(row);
        }
        company.setPharmacist(input.pharmacistName(), input.pharmacistRegNo(), input.pharmacistCouncilState());
        company.touched(by, now);
        mark(tenant.getId(), "LICENCES", DONE);
        return licences();
    }

    // ---------------------------------------------------------------- branches (PLT-03, step 6)

    public record BranchView(UUID id, boolean headOffice, Branch.Details details) {
    }

    public record Branches(List<BranchView> branches, Branch.Details suggestion) {
    }

    @Transactional(readOnly = true)
    public Branches branches() {
        UUID tenantId = TenantContext.requireTenantId();
        List<BranchView> list = branches.findByTenantIdOrderByCreatedAtAsc(tenantId).stream()
                .map(b -> new BranchView(b.getId(), b.isHeadOffice(), b.details())).toList();
        // ONBOARDING.md step 6: the first branch is pre-filled from the company address.
        Branch.Details suggestion = list.isEmpty() ? companies.findFirstByTenantIdAndPrimaryTrue(tenantId)
                .map(Company::details)
                .map(c -> new Branch.Details(c.tradeName() != null ? c.tradeName() : c.legalName(), "HO",
                        c.addressLine1(), c.addressLine2(), c.pin(), c.city(), c.district(), c.stateCode()))
                .orElse(null) : null;
        return new Branches(list, suggestion);
    }

    @Transactional(readOnly = true)
    public BranchView branch(UUID id) {
        Branch b = branches.findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(OnboardingService::branchNotFound);
        return new BranchView(b.getId(), b.isHeadOffice(), b.details());
    }

    @Transactional
    public BranchView createBranch(Branch.Details d) {
        Tenant tenant = editableTenant();
        Company company = companyOrStepOrder(tenant.getId());
        checkBranch(tenant.getId(), company, d, null);
        Instant now = clock.instant();
        boolean first = branches.findByTenantIdOrderByCreatedAtAsc(tenant.getId()).isEmpty();
        Branch b = Branch.of(tenant.getId(), company.getId(), first, TenantContext.userId().orElse(null), now);
        b.update(d);
        branches.save(b);
        mark(tenant.getId(), "BRANCHES", DONE);
        return new BranchView(b.getId(), b.isHeadOffice(), b.details());
    }

    @Transactional
    public BranchView updateBranch(UUID id, Branch.Details d) {
        Tenant tenant = editableTenant();
        Branch b = branches.findByIdAndTenantId(id, tenant.getId()).orElseThrow(OnboardingService::branchNotFound);
        checkBranch(tenant.getId(), companyOrStepOrder(tenant.getId()), d, b);
        b.update(d);
        b.touched(TenantContext.userId().orElse(null), clock.instant());
        return new BranchView(b.getId(), b.isHeadOffice(), b.details());
    }

    private void checkBranch(UUID tenantId, Company company, Branch.Details d, Branch current) {
        if (!d.stateCode().equals(company.getStateCode())) {
            // A shop in another state needs its own GST registration, i.e. another company (PLT-02).
            throw invalid("TENANCY_BRANCH_STATE_MISMATCH", "A branch must be in the company's state.");
        }
        boolean codeChanged = current == null || !current.getCode().equals(d.code());
        if (codeChanged && branches.existsByTenantIdAndCode(tenantId, d.code())) {
            throw new MenoException(HttpStatus.CONFLICT, "TENANCY_BRANCH_CODE_TAKEN", "This branch code is in use.");
        }
    }

    // ---------------------------------------------------------------- books (step 7, FY part of ACX-11)

    public record Books(LocalDate financialYearStart, LocalDate financialYearEnd, LocalDate booksStartDate,
            String label) {
    }

    @Transactional(readOnly = true)
    public Optional<Books> books() {
        UUID tenantId = TenantContext.requireTenantId();
        return companies.findFirstByTenantIdAndPrimaryTrue(tenantId)
                .flatMap(c -> financialYears.findFirstByTenantIdAndCompanyIdOrderByStartDateDesc(tenantId, c.getId()))
                .map(fy -> toBooks(fy.getStartDate(), fy.getEndDate(), fy.getBooksStartDate()));
    }

    @Transactional
    public Books saveBooks(LocalDate start, LocalDate booksStart) {
        Tenant tenant = editableTenant();
        Company company = companyOrStepOrder(tenant.getId());
        if (start.getDayOfMonth() != 1 || start.getMonthValue() != properties.financialYearStartMonth()) {
            throw invalid("TENANCY_FY_START_INVALID", "The financial year starts on 1 "
                    + java.time.Month.of(properties.financialYearStartMonth()).getDisplayName(
                            java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH) + ".");
        }
        LocalDate end = start.plusYears(1).minusDays(1);
        if (booksStart.isBefore(start) || booksStart.isAfter(end)) {
            throw invalid("TENANCY_BOOKS_START_OUTSIDE_FY", "The books start date must be inside the financial year.");
        }
        Instant now = clock.instant();
        UUID by = TenantContext.userId().orElse(null);
        FinancialYear fy = financialYears.findFirstByTenantIdAndCompanyIdOrderByStartDateDesc(tenant.getId(),
                company.getId()).orElseGet(() -> FinancialYear.open(tenant.getId(), company.getId(), by, now));
        fy.update(start, end, booksStart);
        fy.touched(by, now);
        financialYears.save(fy);
        mark(tenant.getId(), "BOOKS", DONE);
        return toBooks(start, end, booksStart);
    }

    private static Books toBooks(LocalDate start, LocalDate end, LocalDate booksStart) {
        // "FY 2026-27": the screen states the dates in words, a wrong FY is the most common mistake.
        String label = "FY " + start.getYear() + "-" + String.format("%02d", end.getYear() % 100);
        return new Books(start, end, booksStart, label);
    }

    // ---------------------------------------------------------------- configuration (AUT-02 subset)

    @Transactional(readOnly = true)
    public Map<String, String> configuration() {
        UUID tenantId = TenantContext.requireTenantId();
        Map<String, String> values = new LinkedHashMap<>();
        settingDefinitions.findAllByOrderBySortOrderAsc().forEach(d -> values.put(d.getKey(), d.getDefaultValue()));
        settings.findByTenantId(tenantId).forEach(s -> values.put(s.getKey(), s.getValue()));
        return values;
    }

    @Transactional
    public Map<String, String> saveConfiguration(Map<String, String> input) {
        Tenant tenant = editableTenant();
        Map<String, ReferenceData.SettingDefinition> defs = settingDefinitions.findAllByOrderBySortOrderAsc().stream()
                .collect(Collectors.toMap(ReferenceData.SettingDefinition::getKey, Function.identity()));
        for (var e : input.entrySet()) {
            ReferenceData.SettingDefinition def = defs.get(e.getKey());
            if (def == null) {
                throw invalid("TENANCY_SETTING_UNKNOWN", "Unknown setting " + e.getKey() + ".");
            }
            if (!validSetting(def, e.getValue())) {
                throw invalid("TENANCY_SETTING_INVALID", "Invalid value for " + e.getKey() + ".");
            }
        }
        Instant now = clock.instant();
        UUID by = TenantContext.userId().orElse(null);
        Map<String, TenantRows.TenantSetting> existing = settings.findByTenantId(tenant.getId()).stream()
                .collect(Collectors.toMap(TenantRows.TenantSetting::getKey, Function.identity()));
        // Every definition gets a row: unsent keys keep their current value or the default.
        for (ReferenceData.SettingDefinition def : defs.values()) {
            TenantRows.TenantSetting row = existing.getOrDefault(def.getKey(),
                    new TenantRows.TenantSetting(tenant.getId(), def.getKey()));
            String value = input.getOrDefault(def.getKey(), row.getValue() != null ? row.getValue() : def.getDefaultValue());
            row.set(value, by, now);
            settings.save(row);
        }
        mark(tenant.getId(), "CONFIGURATION", DONE);
        return configuration();
    }

    private boolean validSetting(ReferenceData.SettingDefinition def, String value) {
        if (value == null) {
            return false;
        }
        return switch (def.getValueType()) {
            case "BOOLEAN" -> value.equals("true") || value.equals("false");
            case "INTEGER" -> {
                try {
                    int v = Integer.parseInt(value);
                    yield (def.getMinValue() == null || v >= def.getMinValue())
                            && (def.getMaxValue() == null || v <= def.getMaxValue());
                } catch (NumberFormatException e) {
                    yield false;
                }
            }
            case "LIST" -> options.existsByListCodeAndCodeAndActiveTrue(def.getListCode(), value);
            default -> false;
        };
    }

    // ---------------------------------------------------------------- go-live (AUT-13)

    public record Check(String code, boolean passed, String message) {
    }

    public record Readiness(boolean ready, List<Check> checks, LocalDate earliestDate, LocalDate latestDate,
            boolean live, LocalDate goLiveDate) {
    }

    @Transactional(readOnly = true)
    public Readiness readiness() {
        UUID tenantId = TenantContext.requireTenantId();
        Tenant tenant = tenant(tenantId);
        Map<String, String> done = progress.findByTenantId(tenantId).stream()
                .collect(Collectors.toMap(TenantRows.OnboardingProgress::getStep,
                        TenantRows.OnboardingProgress::getStatus));
        List<Check> checks = new ArrayList<>();
        for (ReferenceData.OnboardingStep step : steps.findAllByOrderBySortOrderAsc()) {
            if (step.isRequired() && step.isAvailable()) {
                checks.add(new Check("STEP_" + step.getCode(), done.containsKey(step.getCode()),
                        "Complete " + step.getRoute()));
            }
        }
        LocalDate today = LocalDate.now(clock);
        Optional<Company> company = companies.findFirstByTenantIdAndPrimaryTrue(tenantId);
        boolean licencesValid = company.map(c -> {
            Map<Licence.Kind, LicenceEntry> held = licenceMap(tenantId, c.getId());
            return requiredLicences(tenant).stream().allMatch(k -> held.containsKey(k)
                    && held.get(k).validTo() != null && held.get(k).validTo().isAfter(today));
        }).orElse(false);
        checks.add(new Check("LICENCES_VALID", licencesValid, "Required drug licences must be valid today."));
        for (GoLiveCheck extra : goLiveChecks) {
            checks.add(new Check(extra.code(), extra.passed(tenantId), extra.failMessage()));
        }
        LocalDate earliest = books().map(Books::booksStartDate).orElse(today);
        LocalDate latest = today.plusDays(properties.goLiveMaxDaysAhead());
        boolean ready = checks.stream().allMatch(Check::passed);
        return new Readiness(ready, checks, earliest, latest, tenant.isLive(), tenant.getGoLiveDate());
    }

    @Transactional
    public Readiness goLive(LocalDate date) {
        Tenant tenant = editableTenant();
        Readiness readiness = readiness();
        if (!readiness.ready()) {
            throw new MenoException(HttpStatus.CONFLICT, "TENANCY_NOT_READY",
                    "Some set-up steps are not finished yet. See GET /api/v1/onboarding/go-live.");
        }
        if (date.isBefore(readiness.earliestDate()) || date.isAfter(readiness.latestDate())) {
            throw invalid("TENANCY_GO_LIVE_DATE_INVALID", "Pick a go-live date between " + readiness.earliestDate()
                    + " and " + readiness.latestDate() + ".");
        }
        tenant.goLive(date, clock.instant());
        events.publishEvent(new TenantWentLive(tenant.getId(), date));
        return readiness();
    }

    // ---------------------------------------------------------------- helpers

    private Tenant tenant(UUID tenantId) {
        return tenants.findById(tenantId).orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND,
                "TENANCY_TENANT_NOT_FOUND", "Business not found."));
    }

    /** The current tenant, refusing changes once it is live. */
    private Tenant editableTenant() {
        Tenant tenant = tenant(TenantContext.requireTenantId());
        if (tenant.isLive()) {
            throw new MenoException(HttpStatus.CONFLICT, "TENANCY_ALREADY_LIVE",
                    "Set-up is finished. Change these details in Settings.");
        }
        return tenant;
    }

    private Company companyOrStepOrder(UUID tenantId) {
        return companies.findFirstByTenantIdAndPrimaryTrue(tenantId)
                .orElseThrow(() -> stepOrder("Complete the company & GST step first."));
    }

    private Set<Licence.Kind> requiredLicences(Tenant tenant) {
        if (tenant.getBusinessType() == null) {
            return Set.of();
        }
        return businessTypeLicences.findByBusinessType(tenant.getBusinessType()).stream()
                .map(l -> Licence.Kind.valueOf(l.getLicenceKind()))
                .collect(Collectors.toUnmodifiableSet());
    }

    private Map<Licence.Kind, LicenceEntry> licenceMap(UUID tenantId, UUID companyId) {
        Map<Licence.Kind, LicenceEntry> map = new EnumMap<>(Licence.Kind.class);
        licences.findByTenantIdAndCompanyIdAndBranchIdIsNull(tenantId, companyId)
                .forEach(l -> map.put(l.getKind(), new LicenceEntry(l.getNumber(), l.getValidTo())));
        return map;
    }

    private void mark(UUID tenantId, String step, String status) {
        TenantRows.OnboardingProgress row = progress.findById(new TenantRows.ProgressKey(tenantId, step))
                .orElseGet(() -> new TenantRows.OnboardingProgress(tenantId, step));
        row.mark(status, TenantContext.userId().orElse(null), clock.instant());
        progress.save(row);
    }

    private void requireOption(String list, String code, String field) {
        if (code == null || !options.existsByListCodeAndCodeAndActiveTrue(list, code)) {
            throw invalid("TENANCY_OPTION_INVALID", "Choose a valid value for " + field + ".");
        }
    }

    private static String label(Licence.Kind kind) {
        return switch (kind) {
            case DRUG_RETAIL -> "retail drug licence";
            case DRUG_WHOLESALE -> "wholesale drug licence";
            case FSSAI -> "FSSAI licence";
            case NARCOTIC -> "narcotic licence";
        };
    }

    private static MenoException invalid(String code, String message) {
        return new MenoException(HttpStatus.BAD_REQUEST, code, message);
    }

    private static MenoException stepOrder(String message) {
        return new MenoException(HttpStatus.CONFLICT, "TENANCY_STEP_ORDER", message);
    }

    private static MenoException branchNotFound() {
        // 404, never 403, for another tenant's id (MULTI_TENANCY.md: don't leak existence).
        return new MenoException(HttpStatus.NOT_FOUND, "TENANCY_BRANCH_NOT_FOUND", "Branch not found.");
    }
}
