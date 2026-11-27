package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.setupsworks.meno.common.crypto.OneTimeTokens;
import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.api.InvitationAcceptance;
import com.setupsworks.meno.modules.identity.api.LoginAccount;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.Invitation;
import com.setupsworks.meno.modules.identity.domain.RoleDefinition;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.identity.repository.InvitationRepository;
import com.setupsworks.meno.modules.identity.repository.RoleDefinitionRepository;
import com.setupsworks.meno.modules.tenancy.api.BranchDirectory;
import com.setupsworks.meno.modules.tenancy.api.BranchDirectory.BranchSummary;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Accepting a staff invitation (PLT-06, PAGES.md "Accept invitation"). The link token is looked up by its SHA-256
 * only. The new user gets the invitation's role and branches (still checked against the tenant: an archived role or
 * removed branches don't come along), the inviter as created_by, and a verified email because the link was opened from
 * that inbox. One email / mobile = one MENO user across tenants (ux_app_user_email, ux_app_user_mobile).
 */
@Service
class InvitationAcceptanceService implements InvitationAcceptance {

    private static final Logger log = LoggerFactory.getLogger(InvitationAcceptanceService.class);
    private static final String INDIA_PREFIX = "+91";
    private static final String MOBILE_INDEX = "ux_app_user_mobile";

    private final InvitationRepository invitations;
    private final AppUserRepository users;
    private final RoleDefinitionRepository roles;
    private final BranchDirectory branchDirectory;
    private final TenantFacade tenants;
    private final PasswordEncoder passwordEncoder;
    private final IdentityProperties identity;
    private final Clock clock;

    InvitationAcceptanceService(InvitationRepository invitations, AppUserRepository users,
            RoleDefinitionRepository roles, BranchDirectory branchDirectory, TenantFacade tenants,
            PasswordEncoder passwordEncoder, IdentityProperties identity, Clock clock) {
        this.invitations = invitations;
        this.users = users;
        this.roles = roles;
        this.branchDirectory = branchDirectory;
        this.tenants = tenants;
        this.passwordEncoder = passwordEncoder;
        this.identity = identity;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public InvitationPreview preview(String token) {
        Invitation invitation = usable(token);
        UUID tenantId = invitation.getTenantId();
        String business = tenants.displayName(tenantId).orElse("your pharmacy");
        String roleName = roles.findAllForTenant(tenantId).stream()
                .filter(r -> r.getCode().equals(invitation.getRoleCode())).map(RoleDefinition::getLabel).findFirst()
                .orElse(invitation.getRoleCode());
        Map<UUID, BranchSummary> branches = branches(tenantId);
        List<String> branchNames = invitation.getBranchIds().stream().map(branches::get)
                .filter(java.util.Objects::nonNull).map(BranchSummary::name).toList();
        String inviter = invitation.getCreatedBy() == null ? business
                : users.findById(invitation.getCreatedBy()).map(AppUser::getFullName).orElse(business);
        return new InvitationPreview(business, roleName, branchNames, inviter, masked(invitation),
                invitation.getExpiresAt(), identity.minPasswordLength());
    }

    @Override
    @Transactional
    public LoginAccount accept(String token, Accept command) {
        Invitation invitation = usable(token);
        UUID tenantId = invitation.getTenantId();
        if (command.password().length() < identity.minPasswordLength()) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_PASSWORD_TOO_SHORT",
                    "Use at least " + identity.minPasswordLength() + " characters for the password.");
        }
        if (invitation.getEmail() == null) {
            // Mobile-only invitations exist only once SMS is set up; a sign-in still needs an email today.
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_INVITATION_EMAIL_REQUIRED",
                    "This invitation has no email address. Ask the owner to invite you again with your email.");
        }
        RoleDefinition role = roles.findVisible(tenantId, invitation.getRoleCode()).orElseThrow(
                InvitationAcceptanceService::invalid);
        Set<UUID> branchIds = new LinkedHashSet<>(invitation.getBranchIds());
        branchIds.retainAll(branches(tenantId).keySet());
        if (!role.isAllBranches() && branchIds.isEmpty()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_INVITATION_BRANCH_GONE",
                    "The branches on this invitation were removed. Ask the owner to invite you again.");
        }
        String mobile = INDIA_PREFIX + command.mobile();
        // Runs with the RLS bypass, so these see every tenant: one email / mobile = one MENO user.
        if (users.existsByEmail(invitation.getEmail())) {
            throw emailTaken();
        }
        if (users.existsByMobile(mobile)) {
            throw mobileTaken();
        }
        Instant now = clock.instant();
        AppUser user;
        try {
            user = users.saveAndFlush(AppUser.invited(tenantId, invitation.getEmail(), mobile,
                    passwordEncoder.encode(command.password()), command.fullName().trim(), role.getCode(),
                    role.isAllBranches() ? Set.of() : branchIds, invitation.getCreatedBy(), now));
        } catch (DataIntegrityViolationException e) {
            // Two joins with the same email or mobile at the same moment: the unique index decides.
            boolean mobileClash = String.valueOf(e.getMostSpecificCause().getMessage()).contains(MOBILE_INDEX);
            throw mobileClash ? mobileTaken() : emailTaken();
        }
        invitation.accept(user.getId(), now);
        invitations.flush();
        log.info("Invitation {} accepted in tenant {} as user {}", invitation.getId(), tenantId, user.getId());
        return CredentialService.toAccount(user);
    }

    /** Pending, not expired, and its business still active; anything else looks the same from outside. */
    private Invitation usable(String token) {
        Instant now = clock.instant();
        if (token == null || token.isBlank() || token.length() > 100) {
            throw invalid();
        }
        return invitations.findByTokenHash(OneTimeTokens.sha256Hex(token))
                .filter(i -> i.isUsable(now) && tenants.isActive(i.getTenantId()))
                .orElseThrow(InvitationAcceptanceService::invalid);
    }

    private Map<UUID, BranchSummary> branches(UUID tenantId) {
        return branchDirectory.branches(tenantId).stream()
                .collect(Collectors.toMap(BranchSummary::id, Function.identity(), (a, b) -> a));
    }

    /** a•••@shop.in for an email; +91 98•••••210 for a mobile-only invitation. */
    static String masked(Invitation invitation) {
        String email = invitation.getEmail();
        if (email != null) {
            int at = email.indexOf('@');
            return email.charAt(0) + "•••" + email.substring(at);
        }
        String m = invitation.getMobile();
        return m.substring(0, 3) + " " + m.substring(3, 5) + "•••••" + m.substring(m.length() - 3);
    }

    private static MenoException invalid() {
        return new MenoException(HttpStatus.GONE, "IDENTITY_INVITATION_INVALID",
                "This invitation has expired or was already used. Ask the owner to send a new one.");
    }

    private static MenoException emailTaken() {
        return new MenoException(HttpStatus.CONFLICT, "IDENTITY_EMAIL_TAKEN",
                "This email already has a MENO account. Sign in with it, or ask the owner to use another email.");
    }

    private static MenoException mobileTaken() {
        return new MenoException(HttpStatus.CONFLICT, "IDENTITY_MOBILE_TAKEN",
                "This mobile number already has a MENO account. Use another number.");
    }
}
