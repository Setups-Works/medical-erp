package com.setupsworks.meno.modules.identity.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.api.SignupFacade.Command;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.Consent;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.identity.repository.ConsentRepository;
import com.setupsworks.meno.modules.tenancy.api.NewTenant;
import com.setupsworks.meno.modules.tenancy.api.StateView;
import com.setupsworks.meno.modules.tenancy.api.TenantFacade;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;

class SignupServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-26T10:00:00Z");
    private static final String TERMS = "v-test";

    private final TenantFacade tenants = mock(TenantFacade.class);
    private final AppUserRepository users = mock(AppUserRepository.class);
    private final ConsentRepository consents = mock(ConsentRepository.class);
    private final EmailVerificationService emailVerification = mock(EmailVerificationService.class);
    private final UUID tenantId = UUID.randomUUID();

    private SignupService service;

    @BeforeEach
    void setUp() {
        service = service(true);
        when(tenants.isActiveState("33")).thenReturn(true);
        when(tenants.createTenant(any(NewTenant.class))).thenReturn(tenantId);
        when(users.saveAndFlush(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private SignupService service(boolean open) {
        return new SignupService(tenants, users, consents, NoOpPasswordEncoder.getInstance(),
                new IdentityProperties(10, Duration.ofMinutes(15), 10, null),
                new SignupProperties(open, List.of("TRIAL", "DEMO", "LICENSE_KEY"), TERMS), emailVerification,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    private static Command command(String password, String startWith, String terms, String state) {
        return new Command(" Owner Name ", "9876543210", "Owner@Shop.test", password, " Sri Ram Medicals ", state,
                "", startWith, terms);
    }

    private static Command valid() {
        return command("long-enough-pass", "TRIAL", TERMS, "33");
    }

    @Test
    void createsTenantOwnerAndConsentInOneGo() {
        UUID key = UUID.randomUUID();

        var outcome = service.signUp(valid(), key);

        assertThat(outcome.replayed()).isFalse();
        assertThat(outcome.account().tenantId()).isEqualTo(tenantId);
        assertThat(outcome.account().email()).isEqualTo("owner@shop.test");
        assertThat(outcome.account().roles()).containsExactly("OWNER");
        var tenant = ArgumentCaptor.forClass(NewTenant.class);
        verify(tenants).createTenant(tenant.capture());
        assertThat(tenant.getValue()).isEqualTo(new NewTenant("Sri Ram Medicals", "33", "TRIAL", null, key));
        var user = ArgumentCaptor.forClass(AppUser.class);
        verify(users).saveAndFlush(user.capture());
        assertThat(user.getValue().getMobile()).isEqualTo("+919876543210");
        assertThat(user.getValue().getFullName()).isEqualTo("Owner Name");
        verify(consents).save(any(Consent.class));
        verify(emailVerification).issue(user.getValue());
    }

    @Test
    void rulesFromConfigurationAndData() {
        assertError(command("short", "TRIAL", TERMS, "33"), HttpStatus.BAD_REQUEST, "IDENTITY_PASSWORD_TOO_SHORT");
        assertError(command("long-enough-pass", "FREE_FOREVER", TERMS, "33"), HttpStatus.BAD_REQUEST,
                "IDENTITY_START_OPTION_INVALID");
        assertError(command("long-enough-pass", "TRIAL", "old-version", "33"), HttpStatus.BAD_REQUEST,
                "IDENTITY_TERMS_NOT_ACCEPTED");
        assertError(command("long-enough-pass", "TRIAL", TERMS, "99"), HttpStatus.BAD_REQUEST,
                "TENANCY_STATE_UNKNOWN");
        verify(tenants, never()).createTenant(any(NewTenant.class));
    }

    @Test
    void passwordOfExactlyTheMinimumIsAccepted() {
        service.signUp(command("0123456789", "TRIAL", TERMS, "33"), null);
        verify(tenants).createTenant(any(NewTenant.class));
    }

    @Test
    void emailAlreadyUsedIsAConflict() {
        when(users.existsByEmail("owner@shop.test")).thenReturn(true);
        assertError(valid(), HttpStatus.CONFLICT, "IDENTITY_EMAIL_TAKEN");
    }

    @Test
    void racingSignupsWithTheSameEmailEndInAConflict() {
        when(users.saveAndFlush(any(AppUser.class))).thenThrow(new DataIntegrityViolationException("ux_app_user_email"));
        assertError(valid(), HttpStatus.CONFLICT, "IDENTITY_EMAIL_TAKEN");
    }

    @Test
    void mobileAlreadyUsedIsAConflict() {
        when(users.existsByMobile("+919876543210")).thenReturn(true);
        assertError(valid(), HttpStatus.CONFLICT, "IDENTITY_MOBILE_TAKEN");
    }

    @Test
    void racingSignupsWithTheSameMobileEndInAConflict() {
        when(users.saveAndFlush(any(AppUser.class))).thenThrow(new DataIntegrityViolationException(
                "duplicate key value violates unique constraint \"ux_app_user_mobile\""));
        assertError(valid(), HttpStatus.CONFLICT, "IDENTITY_MOBILE_TAKEN");
    }

    @Test
    void closedSignupIsRefused() {
        assertThatThrownBy(() -> service(false).signUp(valid(), null))
                .isInstanceOfSatisfying(MenoException.class, e -> assertThat(e.code()).isEqualTo("IDENTITY_SIGNUP_CLOSED"));
    }

    @Test
    void sameIdempotencyKeyReturnsTheEarlierOwner() {
        UUID key = UUID.randomUUID();
        AppUser owner = AppUser.signedUpOwner(tenantId, "owner@shop.test", "+919876543210", "x", "Owner",
                java.util.Set.of("OWNER"), NOW);
        when(tenants.findBySignupKey(key)).thenReturn(Optional.of(tenantId));
        when(users.findByEmail("owner@shop.test")).thenReturn(Optional.of(owner));

        var outcome = service.signUp(valid(), key);

        assertThat(outcome.replayed()).isTrue();
        assertThat(outcome.account().userId()).isEqualTo(owner.getId());
        verify(tenants, never()).createTenant(any(NewTenant.class));
    }

    @Test
    void sameIdempotencyKeyWithAnotherEmailIsAMismatch() {
        UUID key = UUID.randomUUID();
        when(tenants.findBySignupKey(key)).thenReturn(Optional.of(tenantId));
        when(users.findByEmail("owner@shop.test")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.signUp(valid(), key)).isInstanceOfSatisfying(MenoException.class, e -> {
            assertThat(e.status()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
            assertThat(e.code()).isEqualTo("COMMON_IDEMPOTENCY_MISMATCH");
        });
    }

    @Test
    void optionsComeFromDataAndConfiguration() {
        when(tenants.activeStates()).thenReturn(List.of(new StateView("33", "Tamil Nadu", "STATE")));

        var options = service.options();

        assertThat(options.open()).isTrue();
        assertThat(options.states()).extracting("code").containsExactly("33");
        assertThat(options.startOptions()).containsExactly("TRIAL", "DEMO", "LICENSE_KEY");
        assertThat(options.termsVersion()).isEqualTo(TERMS);
        assertThat(options.minPasswordLength()).isEqualTo(10);
    }

    private void assertError(Command command, HttpStatus status, String code) {
        assertThatThrownBy(() -> service.signUp(command, null)).isInstanceOfSatisfying(MenoException.class, e -> {
            assertThat(e.status()).isEqualTo(status);
            assertThat(e.code()).isEqualTo(code);
        });
    }
}
