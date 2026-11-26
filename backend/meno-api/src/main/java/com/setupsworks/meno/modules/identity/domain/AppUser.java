package com.setupsworks.meno.modules.identity.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_role", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Set<Role> roles = EnumSet.noneOf(Role.class);

    protected AppUser() {
    }

    public AppUser(UUID tenantId, String email, String passwordHash, String fullName, Set<Role> roles, Instant now) {
        this.id = Uuids.v7();
        this.tenantId = tenantId;
        this.email = normalizeEmail(email);
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.status = Status.ACTIVE;
        this.roles = EnumSet.copyOf(roles);
        this.createdAt = now;
        this.updatedAt = now;
    }

    /** Owner from sign-up (AUT-04): mobile and email start unverified until OTP / email link land. */
    public static AppUser signedUpOwner(UUID tenantId, String email, String mobileE164, String passwordHash,
            String fullName, Set<Role> roles, Instant now) {
        AppUser user = new AppUser(tenantId, email, passwordHash, fullName, roles, now);
        user.mobile = mobileE164;
        return user;
    }

    public static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
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

    public String getMobile() {
        return mobile;
    }

    public String getFullName() {
        return fullName;
    }

    public Set<Role> getRoles() {
        return Set.copyOf(roles);
    }
}
