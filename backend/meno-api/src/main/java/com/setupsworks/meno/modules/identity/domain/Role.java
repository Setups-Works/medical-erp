package com.setupsworks.meno.modules.identity.domain;

/**
 * Starting roles for P1 login only. ADR-0014: code must check permissions, never these names.
 * The role / permission / role_permission tables replace this enum in the identity task.
 */
public enum Role {
    OWNER,
    ADMIN,
    PHARMACIST,
    CASHIER
}
