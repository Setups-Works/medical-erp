package com.setupsworks.meno.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.support.CrossTenantSupport;
import com.setupsworks.meno.support.CrossTenantSupport.SignedUp;
import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * The database itself refuses cross-tenant access (MULTI_TENANCY.md layer 4): plain SQL through the app's
 * connection (role meno_app) only sees the current tenant, sees nothing without one, and cannot write into
 * another tenant. If code ever forgets a tenant filter, these policies still hold.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "meno.auth.refresh-cookie-secure=false",
        "meno.signup.terms-version=rls-terms"
})
@AutoConfigureMockMvc
class RowLevelSecurityTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    JdbcTemplate appJdbc;

    SignedUp a;
    SignedUp b;

    @BeforeEach
    void twoTenants() throws Exception {
        a = CrossTenantSupport.signUp(mvc, "a", "rls-terms");
        b = CrossTenantSupport.signUp(mvc, "b", "rls-terms");
    }

    @Test
    void appConnectsAsANonOwnerRole() {
        assertThat(appJdbc.queryForObject("select current_user", String.class)).isEqualTo("meno_app");
        assertThat(appJdbc.queryForObject("select rolbypassrls or rolsuper from pg_roles where rolname = current_user",
                Boolean.class)).isFalse();
    }

    @Test
    void eachTenantSeesOnlyItsOwnRows() {
        TenantContext.callAs(a.tenantId(), a.userId(), () -> {
            assertThat(appJdbc.queryForList("select tenant_id from app_user", UUID.class)).containsOnly(a.tenantId());
            assertThat(appJdbc.queryForList("select id from tenant", UUID.class)).containsExactly(a.tenantId());
            assertThat(appJdbc.queryForObject("select count(*) from consent where tenant_id = ?", Integer.class,
                    b.tenantId())).isZero();
            assertThat(appJdbc.queryForObject("select count(*) from user_role where user_id = ?", Integer.class,
                    b.userId())).isZero();
            return null;
        });
    }

    @Test
    void withoutATenantNothingIsVisible() {
        assertThat(appJdbc.queryForObject("select count(*) from app_user", Integer.class)).isZero();
        assertThat(appJdbc.queryForObject("select count(*) from tenant", Integer.class)).isZero();
    }

    @Test
    void cannotWriteIntoAnotherTenant() {
        assertThatThrownBy(() -> TenantContext.callAs(a.tenantId(), a.userId(), () -> appJdbc.update(
                "insert into consent (id, tenant_id, user_id, kind, version, accepted_at, created_at) "
                        + "values (?, ?, ?, 'TERMS_AND_PRIVACY', 'x', ?, ?)",
                UUID.randomUUID(), b.tenantId(), b.userId(), java.sql.Timestamp.from(Instant.now()),
                java.sql.Timestamp.from(Instant.now()))))
                .rootCause().hasMessageContaining("row-level security");
        assertThat(TenantContext.callAs(a.tenantId(), a.userId(),
                () -> appJdbc.update("update app_user set full_name = 'hijacked' where id = ?", b.userId())))
                .isZero();
    }
}
