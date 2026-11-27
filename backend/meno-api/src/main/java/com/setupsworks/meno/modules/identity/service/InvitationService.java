package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.setupsworks.meno.common.crypto.OneTimeTokens;
import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.Invitation;
import com.setupsworks.meno.modules.identity.domain.RoleDefinition;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.identity.repository.InvitationRepository;
import com.setupsworks.meno.modules.identity.repository.RoleDefinitionRepository;
import com.setupsworks.meno.modules.notification.api.EmailSender;
import com.setupsworks.meno.modules.notification.api.EmailSender.OutgoingEmail;
import com.setupsworks.meno.modules.notification.api.SmsSender;
import com.setupsworks.meno.modules.notification.api.SmsSender.OutgoingSms;
import com.setupsworks.meno.modules.tenancy.api.BranchDirectory;
import com.setupsworks.meno.modules.tenancy.api.BranchDirectory.BranchSummary;
import com.setupsworks.meno.modules.tenancy.api.OnboardingSteps;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;
import com.setupsworks.meno.security.PermissionChecker;
import com.setupsworks.meno.security.TenantContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Staff invitations for the Team step (AUT-09, ONBOARDING.md step 9) and later /admin/users (PLT-06).
 * Roles come from the {@code role} table, branches from tenancy; the link goes out after commit by email and, when
 * an SMS provider is configured, by SMS. Accepting (the /invite page) is a separate use case.
 */
@Service
public class InvitationService {

    public static final String VIEW = "identity.invitation.view";
    public static final String MANAGE = "identity.invitation.manage";
    private static final String TEAM_STEP = "TEAM";
    private static final Logger log = LoggerFactory.getLogger(InvitationService.class);

    private final InvitationRepository invitations;
    private final RoleDefinitionRepository roles;
    private final AppUserRepository users;
    private final BranchDirectory branchDirectory;
    private final TenantFacade tenants;
    private final OnboardingSteps onboardingSteps;
    private final EmailSender emailSender;
    private final SmsSender smsSender;
    private final PermissionChecker permissions;
    private final InvitationProperties properties;
    private final Clock clock;

    InvitationService(InvitationRepository invitations, RoleDefinitionRepository roles, AppUserRepository users,
            BranchDirectory branchDirectory, TenantFacade tenants, OnboardingSteps onboardingSteps,
            EmailSender emailSender, SmsSender smsSender, PermissionChecker permissions,
            InvitationProperties properties, Clock clock) {
        this.invitations = invitations;
        this.roles = roles;
        this.users = users;
        this.branchDirectory = branchDirectory;
        this.tenants = tenants;
        this.onboardingSteps = onboardingSteps;
        this.emailSender = emailSender;
        this.smsSender = smsSender;
        this.permissions = permissions;
        this.properties = properties;
        this.clock = clock;
    }

    // ---------------------------------------------------------------- views

    public record RoleOption(String code, String label) {
    }

    public record BranchOption(UUID id, String name, String code, boolean headOffice) {
    }

    /** Everything the invite form needs; {@code smsAvailable} false means the link can only go by email. */
    public record TeamOptions(List<RoleOption> roles, List<BranchOption> branches, boolean smsAvailable,
            long invitationValidDays) {
    }

    public record TeamInvitation(UUID id, String fullName, String email, String mobile, String roleCode,
            String roleLabel, List<BranchOption> branches, Invitation.DisplayStatus status, Instant sentAt,
            Instant expiresAt, int sendCount) {
    }

    /** API_GUIDELINES.md page envelope. */
    public record TeamInvitationPage(List<TeamInvitation> items, int page, int size, long totalItems, int totalPages) {
    }

    public record NewInvitation(String fullName, String email, String mobileE164, String roleCode,
            Set<UUID> branchIds) {
    }

    // ---------------------------------------------------------------- use cases

    @Transactional(readOnly = true)
    public TeamOptions options() {
        permissions.require(VIEW);
        UUID tenantId = TenantContext.requireTenantId();
        List<RoleOption> roleOptions = roles.findByInvitableTrueOrderBySortOrderAsc().stream()
                .map(r -> new RoleOption(r.getCode(), r.getLabel())).toList();
        List<BranchOption> branches = branchDirectory.branches(tenantId).stream().map(InvitationService::option)
                .toList();
        return new TeamOptions(roleOptions, branches, smsSender.enabled(), properties.ttl().toDays());
    }

    @Transactional(readOnly = true)
    public TeamInvitationPage list(int page, int size) {
        permissions.require(VIEW);
        UUID tenantId = TenantContext.requireTenantId();
        Page<Invitation> result = invitations.findByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(page, size));
        Lookups lookups = lookups(tenantId);
        Instant now = clock.instant();
        return new TeamInvitationPage(result.getContent().stream().map(i -> view(i, lookups, now)).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public TeamInvitation invite(NewInvitation cmd) {
        permissions.require(MANAGE);
        UUID tenantId = TenantContext.requireTenantId();
        UUID by = TenantContext.userId().orElse(null);
        String email = AppUser.normalizeEmail(blankToNull(cmd.email()));
        String mobile = cmd.mobileE164();
        if (email == null && mobile == null) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_INVITATION_CONTACT_REQUIRED",
                    "Enter an email address or a mobile number.");
        }
        if (email == null && !smsSender.enabled()) {
            // A mobile-only invite would never arrive; say so instead of pretending it went out.
            throw new MenoException(HttpStatus.SERVICE_UNAVAILABLE, "NOTIFICATION_CHANNEL_DISABLED",
                    "SMS isn't set up yet. Add an email address to send the invitation.");
        }
        RoleDefinition role = roles.findById(cmd.roleCode()).filter(RoleDefinition::isInvitable)
                .orElseThrow(() -> new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_ROLE_INVALID",
                        "Choose a role from the list."));
        Lookups lookups = lookups(tenantId);
        if (cmd.branchIds().isEmpty() || !lookups.branches().keySet().containsAll(cmd.branchIds())) {
            // Another tenant's branch id looks exactly like a missing one.
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_INVITATION_BRANCH_INVALID",
                    "Choose at least one of your branches.");
        }
        // Under RLS these see this tenant's users only, on purpose: an invite must not reveal whether an email or
        // mobile belongs to another business (auth rule 2). One email / mobile = one MENO user is enforced when
        // the link is accepted (ux_app_user_email, ux_app_user_mobile).
        if (email != null && users.existsByEmail(email)) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_EMAIL_TAKEN",
                    "Someone on your team already uses this email.");
        }
        if (mobile != null && users.existsByMobile(mobile)) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_MOBILE_TAKEN",
                    "Someone on your team already uses this mobile number.");
        }
        if ((email != null && invitations.existsByTenantIdAndEmailAndStatus(tenantId, email,
                Invitation.Status.PENDING))
                || (mobile != null && invitations.existsByTenantIdAndMobileAndStatus(tenantId, mobile,
                        Invitation.Status.PENDING))) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_INVITATION_PENDING",
                    "This person already has an open invitation. Resend it instead.");
        }
        Instant now = clock.instant();
        String token = OneTimeTokens.newToken();
        Invitation invitation = invitations.save(new Invitation(tenantId, cmd.fullName().trim(), email, mobile,
                role.getCode(), cmd.branchIds(), OneTimeTokens.sha256Hex(token), properties.ttl(), by, now));
        onboardingSteps.markDone(tenantId, TEAM_STEP);
        deliver(invitation, token, role.getLabel(), inviterName(by));
        log.info("Invitation {} created for tenant {} with role {}", invitation.getId(), tenantId, role.getCode());
        return view(invitation, lookups, now);
    }

    @Transactional
    public TeamInvitation resend(UUID id) {
        permissions.require(MANAGE);
        UUID tenantId = TenantContext.requireTenantId();
        Invitation invitation = pending(id, tenantId);
        Instant now = clock.instant();
        if (invitation.getSentAt().plus(properties.resendCooldown()).isAfter(now)) {
            throw new MenoException(HttpStatus.TOO_MANY_REQUESTS, "IDENTITY_INVITATION_TOO_SOON",
                    "We just sent this invitation. Please wait a minute before sending it again.");
        }
        UUID by = TenantContext.userId().orElse(null);
        String token = OneTimeTokens.newToken();
        invitation.resend(OneTimeTokens.sha256Hex(token), properties.ttl(), by, now);
        Lookups lookups = lookups(tenantId);
        deliver(invitation, token, lookups.roleLabel(invitation.getRoleCode()), inviterName(by));
        return view(invitation, lookups, now);
    }

    @Transactional
    public TeamInvitation revoke(UUID id) {
        permissions.require(MANAGE);
        UUID tenantId = TenantContext.requireTenantId();
        Invitation invitation = pending(id, tenantId);
        Instant now = clock.instant();
        invitation.revoke(TenantContext.userId().orElse(null), now);
        return view(invitation, lookups(tenantId), now);
    }

    // ---------------------------------------------------------------- helpers

    private Invitation pending(UUID id, UUID tenantId) {
        Invitation invitation = invitations.findByIdAndTenantId(id, tenantId).orElseThrow(() -> new MenoException(
                HttpStatus.NOT_FOUND, "IDENTITY_INVITATION_NOT_FOUND", "Invitation not found."));
        if (!invitation.isPending()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_INVITATION_NOT_PENDING",
                    "This invitation was already accepted or revoked.");
        }
        return invitation;
    }

    private record Lookups(Map<UUID, BranchOption> branches, Map<String, String> roleLabels) {

        String roleLabel(String code) {
            return roleLabels.getOrDefault(code, code);
        }
    }

    private Lookups lookups(UUID tenantId) {
        Map<UUID, BranchOption> branches = branchDirectory.branches(tenantId).stream().map(InvitationService::option)
                .collect(Collectors.toMap(BranchOption::id, Function.identity(), (a, b) -> a,
                        java.util.LinkedHashMap::new));
        Map<String, String> labels = roles.findAllByOrderBySortOrderAsc().stream()
                .collect(Collectors.toMap(RoleDefinition::getCode, RoleDefinition::getLabel));
        return new Lookups(branches, labels);
    }

    private static BranchOption option(BranchSummary b) {
        return new BranchOption(b.id(), b.name(), b.code(), b.headOffice());
    }

    private static TeamInvitation view(Invitation i, Lookups lookups, Instant now) {
        List<BranchOption> branches = i.getBranchIds().stream().map(lookups.branches()::get)
                .filter(java.util.Objects::nonNull).toList();
        return new TeamInvitation(i.getId(), i.getFullName(), i.getEmail(), i.getMobile(), i.getRoleCode(),
                lookups.roleLabel(i.getRoleCode()), branches, i.displayStatus(now), i.getSentAt(), i.getExpiresAt(),
                i.getSendCount());
    }

    private String inviterName(UUID userId) {
        return userId == null ? null : users.findById(userId).map(AppUser::getFullName).orElse(null);
    }

    /** Sends after commit, so a mail / SMS failure never undoes the invitation (the owner can resend). */
    private void deliver(Invitation invitation, String token, String roleLabel, String inviter) {
        String business = tenants.displayName(invitation.getTenantId()).orElse("your pharmacy");
        String link = properties.linkBase() + token;
        long days = properties.ttl().toDays();
        String from = inviter == null ? business : inviter + " from " + business;
        if (invitation.getEmail() != null) {
            OutgoingEmail email = new OutgoingEmail(invitation.getEmail(), "You're invited to join " + business
                    + " on MENO", """
                    Hello %s,

                    %s has invited you to MENO as %s.

                    Open this link to set your password and join:

                    %s

                    The link works for %d days. If you weren't expecting this, ignore this email.
                    """.formatted(invitation.getFullName(), from, roleLabel, link, days));
            afterCommit(() -> emailSender.send(email));
        }
        if (invitation.getMobile() != null && smsSender.enabled()) {
            String template = "%s invited you to MENO as %s. Join: %s (valid %d days)";
            // The log-only channel prints logText, so the link token never reaches a log file.
            OutgoingSms sms = new OutgoingSms(invitation.getMobile(),
                    template.formatted(business, roleLabel, link, days),
                    template.formatted(business, roleLabel, "[invite link]", days));
            afterCommit(() -> smsSender.send(sms));
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static void afterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }
}
