package com.setupsworks.meno.modules.identity.api;

import java.util.Set;
import java.util.UUID;

/** A user who may sign in right now. Never carries the password hash out of the identity module. */
public record LoginAccount(UUID userId, UUID tenantId, String email, String fullName, Set<String> roles) {

    public LoginAccount {
        roles = Set.copyOf(roles);
    }
}
