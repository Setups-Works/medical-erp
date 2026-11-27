package com.setupsworks.meno.modules.identity.domain;

/**
 * Role codes that platform code itself has to create (sign-up and the first-owner bootstrap make an OWNER). Users
 * hold any code from the {@code role} table ({@link RoleDefinition}); ADR-0014: code checks permissions, never these
 * names.
 */
public enum Role {
    OWNER
}
