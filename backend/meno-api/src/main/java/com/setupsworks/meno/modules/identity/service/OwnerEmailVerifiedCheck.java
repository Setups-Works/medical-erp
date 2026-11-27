package com.setupsworks.meno.modules.identity.service;

import java.util.UUID;

import com.setupsworks.meno.modules.identity.domain.Role;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.tenancy.api.GoLiveCheck;

import org.springframework.stereotype.Component;

/** Go-live readiness (ONBOARDING.md step 14): "email verified" for every owner of the business. */
@Component
class OwnerEmailVerifiedCheck implements GoLiveCheck {

    private final AppUserRepository users;

    OwnerEmailVerifiedCheck(AppUserRepository users) {
        this.users = users;
    }

    @Override
    public String code() {
        return "OWNER_EMAIL_VERIFIED";
    }

    @Override
    public boolean passed(UUID tenantId) {
        var owners = users.findByTenantId(tenantId).stream().filter(u -> u.getRoles().contains(Role.OWNER.name())).toList();
        return !owners.isEmpty() && owners.stream().allMatch(u -> u.isEmailVerified());
    }

    @Override
    public String failMessage() {
        return "Confirm the owner's email with the link we sent (or ask for a new one).";
    }
}
