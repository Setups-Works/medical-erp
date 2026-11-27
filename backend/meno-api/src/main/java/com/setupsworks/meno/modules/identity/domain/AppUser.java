package com.setupsworks.meno.modules.identity.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "app_user")
public class AppUser {

    private static final Pattern INDIAN_MOBILE = Pattern.compile("(?:\\+?91|0)?([6-9][0-9]{9})");

    public enum Status { ACTIVE, DISABLED }

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    /** E.164 (+91…); null for users created before sign-up existed. */
    @Column
    private String mobile;

    @Column(name = "mobile_verified_at")
    private Instant mobileVerifiedAt;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Version
    private long version;

    /** Role codes from the {@code role} table (FK); permissions come from role_permission, never from the name. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_role", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false)
    private Set<String> roles = new LinkedHashSet<>();

    /** Branches the user works at (user_branch); empty when a role covers every branch. */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_branch", joinColumns = @JoinColumn(name = "user_id"))
    private Set<UserBranch> branches = new LinkedHashSet<>();

    protected AppUser() {
    }

    public AppUser(UUID tenantId, String email, String passwordHash, String fullName, Set<String> roles, Instant now) {
        this.id = Uuids.v7();
        this.tenantId = tenantId;
        this.email = normalizeEmail(email);
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.status = Status.ACTIVE;
        this.roles = new LinkedHashSet<>(roles);
        this.createdAt = now;
        this.updatedAt = now;
    }

    /** Owner from sign-up (AUT-04): mobile and email start unverified until OTP / email link land. */
    public static AppUser signedUpOwner(UUID tenantId, String email, String mobileE164, String passwordHash,
            String fullName, Set<String> roles, Instant now) {
        AppUser user = new AppUser(tenantId, email, passwordHash, fullName, roles, now);
        user.mobile = mobileE164;
        return user;
    }

    /**
     * A person who joined from a staff invitation (PLT-06): the role and branches the owner chose, and the email
     * counted as verified because the link reached that inbox. {@code invitedBy} becomes created_by.
     */
    public static AppUser invited(UUID tenantId, String email, String mobileE164, String passwordHash, String fullName,
            String roleCode, Set<UUID> branchIds, UUID invitedBy, Instant now) {
        AppUser user = new AppUser(tenantId, email, passwordHash, fullName, Set.of(roleCode), now);
        user.mobile = mobileE164;
        user.createdBy = invitedBy;
        user.updatedBy = invitedBy;
        branchIds.forEach(b -> user.branches.add(new UserBranch(tenantId, b, invitedBy, now)));
        user.markEmailVerified(now);
        return user;
    }

    public static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    /**
     * Indian mobile in E.164 ({@code +91} + 10 digits starting 6-9, VALIDATION_AND_BUSINESS_RULES.md "Phone (India)"),
     * or empty when {@code raw} isn't one. Accepts the 10 digits with or without {@code +91} / {@code 91} / {@code 0},
     * spaces and dashes (like the web form), because that is how people type their number at sign-in.
     */
    public static Optional<String> normalizeMobile(String raw) {
        if (raw == null) {
            return Optional.empty();
        }
        Matcher m = INDIAN_MOBILE.matcher(raw.replaceAll("[\\s-]", ""));
        return m.matches() ? Optional.of("+91" + m.group(1)) : Optional.empty();
    }

    public boolean isActive() {
        return status == Status.ACTIVE;
    }

    public boolean isLocked(Instant now) {
        return lockedUntil != null && lockedUntil.isAfter(now);
    }

    /** Counts a wrong password; locks the account once {@code maxAttempts} is reached. */
    public void recordFailedLogin(Instant now, int maxAttempts, Duration lockDuration) {
        failedAttempts++;
        if (failedAttempts >= maxAttempts) {
            lockedUntil = now.plus(lockDuration);
            failedAttempts = 0;
        }
        updatedAt = now;
    }

    /** New password (already hashed); a reset also lifts any lockout from the old password's failures. */
    public void changePassword(String newHash, Instant now) {
        passwordHash = newHash;
        failedAttempts = 0;
        lockedUntil = null;
        updatedAt = now;
    }

    public void recordSuccessfulLogin(Instant now) {
        failedAttempts = 0;
        lockedUntil = null;
        lastLoginAt = now;
        updatedAt = now;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void markEmailVerified(Instant now) {
        if (emailVerifiedAt == null) {
            emailVerifiedAt = now;
            updatedAt = now;
        }
    }

    public void markMobileVerified(Instant now) {
        if (mobileVerifiedAt == null) {
            mobileVerifiedAt = now;
            updatedAt = now;
        }
    }

    public boolean isEmailVerified() {
        return emailVerifiedAt != null;
    }

    public boolean isMobileVerified() {
        return mobileVerifiedAt != null;
    }

    public String getMobile() {
        return mobile;
    }

    public String getFullName() {
        return fullName;
    }

    public Set<String> getRoles() {
        return Set.copyOf(roles);
    }

    public Set<UUID> getBranchIds() {
        Set<UUID> ids = new LinkedHashSet<>();
        branches.forEach(b -> ids.add(b.branchId));
        return ids;
    }

    public Status getStatus() {
        return status;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public long getVersion() {
        return version;
    }

    /**
     * New roles and branches (PLT-06). Whole sets are replaced; the service has already checked the roles exist and
     * the branches belong to this tenant.
     */
    public void changeAccess(Collection<String> newRoles, Collection<UUID> branchIds, UUID by, Instant now) {
        roles.clear();
        roles.addAll(newRoles);
        Set<UserBranch> wanted = new LinkedHashSet<>();
        branchIds.forEach(b -> wanted.add(new UserBranch(tenantId, b, by, now)));
        branches.retainAll(wanted);
        branches.addAll(wanted);
        touch(by, now);
    }

    /** Can't sign in or refresh a session any more; history (documents, audit) keeps pointing at this user. */
    public void deactivate(UUID by, Instant now) {
        status = Status.DISABLED;
        touch(by, now);
    }

    public void reactivate(UUID by, Instant now) {
        status = Status.ACTIVE;
        failedAttempts = 0;
        lockedUntil = null;
        touch(by, now);
    }

    private void touch(UUID by, Instant now) {
        updatedBy = by;
        updatedAt = now;
    }

    /** One row of user_branch. tenant_id is repeated so the row has its own RLS policy and tenant index. */
    @Embeddable
    public static class UserBranch {

        @Column(name = "tenant_id", nullable = false)
        private UUID tenantId;

        @Column(name = "branch_id", nullable = false)
        private UUID branchId;

        @Column(name = "created_at", nullable = false)
        private Instant createdAt;

        @Column(name = "created_by")
        private UUID createdBy;

        protected UserBranch() {
        }

        UserBranch(UUID tenantId, UUID branchId, UUID createdBy, Instant createdAt) {
            this.tenantId = tenantId;
            this.branchId = branchId;
            this.createdBy = createdBy;
            this.createdAt = createdAt;
        }

        /** Same branch = same row; when it was added doesn't matter for set membership. */
        @Override
        public boolean equals(Object o) {
            return o instanceof UserBranch other && java.util.Objects.equals(branchId, other.branchId)
                    && java.util.Objects.equals(tenantId, other.tenantId);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(tenantId, branchId);
        }
    }
}
