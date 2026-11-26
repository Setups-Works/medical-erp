package com.setupsworks.meno.security;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.springframework.jdbc.datasource.DelegatingDataSource;

/**
 * Copies {@link TenantContext} into the PostgreSQL session on every connection checkout, so the RLS policies
 * ({@code app_current_tenant()}, {@code app_rls_bypass()}) see it. Both values are always written, so a pooled
 * connection never keeps the previous request's tenant. Transactions take their connection once, at the start.
 */
class TenantAwareDataSource extends DelegatingDataSource {

    private static final String SET_CONTEXT =
            "select set_config('app.tenant_id', ?, false), set_config('app.rls_bypass', ?, false)";

    TenantAwareDataSource(DataSource target) {
        super(target);
    }

    @Override
    public Connection getConnection() throws SQLException {
        return applyContext(super.getConnection());
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        return applyContext(super.getConnection(username, password));
    }

    private static Connection applyContext(Connection connection) throws SQLException {
        try (PreparedStatement ps = connection.prepareStatement(SET_CONTEXT)) {
            ps.setString(1, TenantContext.tenantId().map(Object::toString).orElse(""));
            ps.setString(2, TenantContext.isSystem() ? "on" : "off");
            ps.execute();
        } catch (SQLException e) {
            connection.close();
            throw e;
        }
        return connection;
    }
}
