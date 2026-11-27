package com.setupsworks.meno.modules.identity.service;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Staff invitations (AUT-09). ⚠ Link lifetime of 7 days is a starting value to confirm (not in ONBOARDING.md);
 * it is configuration so it changes without a release.
 */
@ConfigurationProperties("meno.identity.invitation")
public record InvitationProperties(
        @DefaultValue("7d") Duration ttl,
        @DefaultValue("60s") Duration resendCooldown,
        /* Base of the link sent to the invitee; the token is appended (web /invite page). */
        @DefaultValue("http://localhost:3000/invite/?token=") String linkBase) {
}
