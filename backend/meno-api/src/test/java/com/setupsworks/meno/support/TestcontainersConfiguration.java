package com.setupsworks.meno.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.test.context.DynamicPropertyRegistrar;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Real PostgreSQL 17 (ADR-0013). Flyway migrates as the container superuser; the app connects as the
 * non-owner role {@code meno_app} (db/test-init.sql), exactly like production, so RLS is really exercised.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    static final String APP_USER = "meno_app";

    @Bean
    PostgreSQLContainer postgresContainer() {
        return new PostgreSQLContainer(DockerImageName.parse("postgres:17")).withInitScript("db/test-init.sql");
    }

    @Bean
    DynamicPropertyRegistrar postgresProperties(PostgreSQLContainer postgres) {
        return registry -> {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", () -> APP_USER);
            registry.add("spring.datasource.password", () -> APP_USER);
            registry.add("spring.flyway.url", postgres::getJdbcUrl);
            registry.add("spring.flyway.user", postgres::getUsername);
            registry.add("spring.flyway.password", postgres::getPassword);
        };
    }

    /** Superuser SQL for test assertions only (sees every tenant). Not a JdbcTemplate bean on purpose. */
    @Bean
    AdminSql adminSql(PostgreSQLContainer postgres) {
        return new AdminSql(new JdbcTemplate(
                new DriverManagerDataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())));
    }

    public record AdminSql(JdbcTemplate jdbc) {
    }
}
