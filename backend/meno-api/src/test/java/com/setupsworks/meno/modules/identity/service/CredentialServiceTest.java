package com.setupsworks.meno.modules.identity.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Set;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.identity.api.CredentialCheck.Result;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class CredentialServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-26T10:00:00Z");
    private static final int MAX_ATTEMPTS = 3;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private final AppUserRepository users = mock(AppUserRepository.class);
    private final TenantFacade tenants = mock(TenantFacade.class);
    private final IdentityProperties props = new IdentityProperties(MAX_ATTEMPTS, Duration.ofMinutes(15), 8, null);

    private CredentialService service;
    private AppUser user;
    private final UUID tenantId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new CredentialService(users, tenants, encoder, props, Clock.fixed(NOW, ZoneOffset.UTC));
        user = new AppUser(tenantId, "Owner@Test.Local", encoder.encode("right-pass"), "Owner",
                Set.of("OWNER"), NOW);
        when(users.findByEmail("owner@test.local")).thenReturn(Optional.of(user));
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        when(tenants.isActive(tenantId)).thenReturn(true);
    }

    @Test
    void rightPasswordReturnsTheAccountWithEmailNormalised() {
        Result result = service.check("  OWNER@test.local ", "right-pass");

        assertThat(result).isInstanceOfSatisfying(Result.Ok.class, ok -> {
            assertThat(ok.account().email()).isEqualTo("owner@test.local");
            assertThat(ok.account().roles()).containsExactly("OWNER");
        });
    }

    @Test
    void locksAfterMaxFailedAttemptsEvenForTheRightPassword() {
        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            assertThat(service.check("owner@test.local", "nope")).isInstanceOf(Result.InvalidCredentials.class);
        }
        assertThat(user.isLocked(NOW)).isTrue();
        assertThat(service.check("owner@test.local", "right-pass")).isInstanceOf(Result.Locked.class);
        assertThat(service.findSignInAllowed(user.getId())).isEmpty();
    }

    @Test
    void unknownEmailGivesTheSameResultAsAWrongPassword() {
        when(users.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThat(service.check("ghost@test.local", "x")).isInstanceOf(Result.InvalidCredentials.class);
    }

    @Test
    void suspendedTenantCannotSignIn() {
        when(tenants.isActive(tenantId)).thenReturn(false);

        assertThat(service.check("owner@test.local", "right-pass")).isInstanceOf(Result.Disabled.class);
        assertThat(service.findSignInAllowed(user.getId())).isEmpty();
    }

    @Test
    void mobileInAnyCommonFormFindsTheSameUser() {
        when(users.findByMobile("+919876543210")).thenReturn(Optional.of(user));

        for (String mobile : new String[] {"9876543210", "+919876543210", "919876543210", "98765 43210", "98765-43210"}) {
            assertThat(service.check(mobile, "right-pass")).isInstanceOf(Result.Ok.class);
        }
    }

    @Test
    void malformedIdentifierIsAWrongPasswordAndNeverQueried() {
        for (String identifier : new String[] {"5876543210", "98765", "", "  ", "abc"}) {
            assertThat(service.check(identifier, "right-pass")).isInstanceOf(Result.InvalidCredentials.class);
        }
        verify(users, never()).findByMobile(anyString());
    }
}
