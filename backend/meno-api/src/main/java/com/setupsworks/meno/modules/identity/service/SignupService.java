package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Set;
import java.util.Objects;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.api.LoginAccount;
import com.setupsworks.meno.modules.identity.api.SignupFacade;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.Consent;
import com.setupsworks.meno.modules.identity.domain.Role;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.identity.repository.ConsentRepository;
import com.setupsworks.meno.modules.tenancy.api.NewTenant;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Sign-up step 1 (ONBOARDING.md): tenant + owner + consent in one transaction. Field formats are checked by
 * Bean Validation on the request; this class owns the rules that need data or configuration.
 * The email link goes out after commit (EmailVerificationService); mobile OTP waits for an SMS provider (INT-02).
 */
@Service
class SignupService implements SignupFacade {

    private static final Logger log = LoggerFactory.getLogger(SignupService.class);
    private static final String INDIA_PREFIX = "+91";
    private static final String MOBILE_INDEX = "ux_app_user_mobile";

    private final TenantFacade tenants;
    private final AppUserRepository users;
    private final ConsentRepository consents;
    private final PasswordEncoder passwordEncoder;
    private final IdentityProperties identity;
    private final SignupProperties signup;
    private final EmailVerificationService emailVerification;
    private final Clock clock;

    SignupService(TenantFacade tenants, AppUserRepository users, ConsentRepository consents,
            PasswordEncoder passwordEncoder, IdentityProperties identity, SignupProperties signup,
            EmailVerificationService emailVerification, Clock clock) {
        this.emailVerification = emailVerification;
        this.tenants = tenants;
        this.users = users;
        this.consents = consents;
        this.passwordEncoder = passwordEncoder;
        this.identity = identity;
        this.signup = signup;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public Options options() {
        return new Options(signup.enabled(),
                tenants.activeStates().stream().map(s -> new StateOption(s.code(), s.name(), s.kind())).toList(),
                signup.startOptions(), signup.termsVersion(), identity.minPasswordLength());
    }

    @Override
    @Transactional
    public Outcome signUp(Command command, UUID idempotencyKey) {
        if (!signup.enabled()) {
            throw new MenoException(HttpStatus.FORBIDDEN, "IDENTITY_SIGNUP_CLOSED",
                    "Sign-up is closed. Contact us to get an account.");
        }
        String email = AppUser.normalizeEmail(command.email());
        if (idempotencyKey != null) {
            var earlier = tenants.findBySignupKey(idempotencyKey);
            if (earlier.isPresent()) {
                return new Outcome(replay(earlier.get(), email), true);
            }
        }
        checkRules(command);
        String mobile = INDIA_PREFIX + command.mobile();
        if (users.existsByEmail(email)) {
            throw emailTaken();
        }
        if (users.existsByMobile(mobile)) {
            throw mobileTaken();
        }

        Instant now = clock.instant();
        UUID tenantId = tenants.createTenant(new NewTenant(command.businessName().trim(), command.stateCode(),
                command.startWith(), blankToNull(command.partnerCode()), idempotencyKey));
        AppUser owner;
        try {
            owner = users.saveAndFlush(AppUser.signedUpOwner(tenantId, email, mobile,
                    passwordEncoder.encode(command.password()), command.ownerName().trim(), Set.of(Role.OWNER.name()),
                    now));
        } catch (DataIntegrityViolationException e) {
            // Two sign-ups with the same email or mobile at the same moment: the unique index decides.
            boolean mobileClash = String.valueOf(e.getMostSpecificCause().getMessage()).contains(MOBILE_INDEX);
            throw mobileClash ? mobileTaken() : emailTaken();
        }
        consents.save(new Consent(tenantId, owner.getId(), Consent.Kind.TERMS_AND_PRIVACY,
                command.acceptedTermsVersion(), now));
        emailVerification.issue(owner);
        log.info("Sign-up created tenant {} with owner {}", tenantId, owner.getId());
        return new Outcome(CredentialService.toAccount(owner), false);
    }

    private void checkRules(Command command) {
        if (command.password().length() < identity.minPasswordLength()) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_PASSWORD_TOO_SHORT",
                    "Use at least " + identity.minPasswordLength() + " characters for the password.");
        }
        if (!signup.startOptions().contains(command.startWith())) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_START_OPTION_INVALID",
                    "Choose how you want to start.");
        }
        if (!Objects.equals(signup.termsVersion(), command.acceptedTermsVersion())) {
            // The screen showed an older notice (or none): it must reload and ask again.
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_TERMS_NOT_ACCEPTED",
                    "Please read and accept the latest terms and privacy notice.");
        }
        if (!tenants.isActiveState(command.stateCode())) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "TENANCY_STATE_UNKNOWN", "Choose your state.");
        }
    }

    /** Same Idempotency-Key again: return the owner it created, but only for the same email. */
    private LoginAccount replay(UUID tenantId, String email) {
        return users.findByEmail(email)
                .filter(u -> u.getTenantId().equals(tenantId) && u.isActive())
                .map(CredentialService::toAccount)
                .orElseThrow(() -> new MenoException(HttpStatus.UNPROCESSABLE_ENTITY, "COMMON_IDEMPOTENCY_MISMATCH",
                        "This request was already used for a different sign-up."));
    }

    private static MenoException emailTaken() {
        return new MenoException(HttpStatus.CONFLICT, "IDENTITY_EMAIL_TAKEN",
                "An account with this email already exists. Sign in instead.");
    }

    private static MenoException mobileTaken() {
        return new MenoException(HttpStatus.CONFLICT, "IDENTITY_MOBILE_TAKEN",
                "An account with this mobile number already exists. Sign in instead.");
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
