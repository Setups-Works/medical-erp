package com.setupsworks.meno.modules.identity.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Permission lists per role and tenant (V202611271600): MENO's defaults in role_permission with tenant_id null, a
 * tenant's own list in role_permission rows with its tenant_id once role_override says it owns that role's list.
 * Plain JDBC because the rows have no identity of their own and the default / tenant split is a nullable key.
 * Every statement names the tenant; RLS is the safety net.
 */
@Repository
public class RolePermissionStore {

    /** A permission from the catalogue, with its display group (permission_module). */
    public record CatalogueEntry(String code, String description, String moduleCode, String moduleLabel,
            int moduleOrder) {
    }

    /** The tenant owns this role's list since {@code version} 1; 0 means it still follows MENO's defaults. */
    public record ListOwnership(String role, long version) {
    }

    private final JdbcTemplate jdbc;

    RolePermissionStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Every permission, grouped by module in display order. Unknown modules fall in last under their code. */
    public List<CatalogueEntry> catalogue() {
        return jdbc.query("""
                select p.code, p.description, split_part(p.code, '.', 1) as module,
                       coalesce(m.label, split_part(p.code, '.', 1)) as module_label, coalesce(m.sort_order, 999) as ord
                  from permission p left join permission_module m on m.code = split_part(p.code, '.', 1)
                 order by ord, module, p.code""",
                (rs, i) -> new CatalogueEntry(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4),
                        rs.getInt(5)));
    }

    public Set<String> knownPermissions() {
        return new HashSet<>(jdbc.queryForList("select code from permission", String.class));
    }

    /** The tenant's overrides by role code. */
    public Map<String, ListOwnership> overrides(UUID tenantId) {
        Map<String, ListOwnership> out = new HashMap<>();
        jdbc.query("select role, version from role_override where tenant_id = ?",
                rs -> {
                    out.put(rs.getString(1), new ListOwnership(rs.getString(1), rs.getLong(2)));
                }, tenantId);
        return out;
    }

    public Optional<ListOwnership> override(UUID tenantId, String role) {
        return Optional.ofNullable(overrides(tenantId).get(role));
    }

    /** What each of {@code roles} may do for this tenant right now (its own list, or the defaults). */
    public Map<String, Set<String>> effective(UUID tenantId, Collection<String> roles) {
        Map<String, Set<String>> out = new LinkedHashMap<>();
        roles.forEach(r -> out.put(r, new TreeSet<>()));
        jdbc.query("""
                select rp.role, rp.permission_code from role_permission rp
                  left join role_override o on o.tenant_id = ? and o.role = rp.role
                 where rp.tenant_id is not distinct from o.tenant_id""",
                rs -> {
                    Set<String> set = out.get(rs.getString(1));
                    if (set != null) {
                        set.add(rs.getString(2));
                    }
                }, tenantId);
        return out;
    }

    public Set<String> effective(UUID tenantId, String role) {
        return effective(tenantId, List.of(role)).get(role);
    }

    /** MENO's default list for a role (empty for custom roles). */
    public Set<String> defaults(String role) {
        return new TreeSet<>(jdbc.queryForList(
                "select permission_code from role_permission where tenant_id is null and role = ?", String.class,
                role));
    }

    /**
     * Replaces the tenant's list for {@code role}, taking ownership of it first if needed. Returns the new override
     * version. The caller checked the version, the role and the permission codes.
     */
    public long replace(UUID tenantId, String role, Set<String> permissions, UUID by, Instant now) {
        Timestamp at = Timestamp.from(now);
        int updated = jdbc.update("""
                update role_override set version = version + 1, updated_at = ?, updated_by = ?
                 where tenant_id = ? and role = ?""", at, by, tenantId, role);
        if (updated == 0) {
            jdbc.update("""
                    insert into role_override (tenant_id, role, created_at, created_by, updated_at, updated_by, version)
                    values (?, ?, ?, ?, ?, ?, 1)""", tenantId, role, at, by, at, by);
        }
        jdbc.update("delete from role_permission where tenant_id = ? and role = ?", tenantId, role);
        jdbc.batchUpdate("insert into role_permission (tenant_id, role, permission_code) values (?, ?, ?)",
                permissions.stream().map(p -> new Object[] { tenantId, role, p }).toList());
        return jdbc.queryForObject("select version from role_override where tenant_id = ? and role = ?", Long.class,
                tenantId, role);
    }

    /** Back to MENO's defaults: the tenant's list and its ownership go. */
    public void reset(UUID tenantId, String role) {
        jdbc.update("delete from role_permission where tenant_id = ? and role = ?", tenantId, role);
        jdbc.update("delete from role_override where tenant_id = ? and role = ?", tenantId, role);
    }

    /** People in the tenant holding each role, active and deactivated. */
    public Map<String, long[]> holders(UUID tenantId) {
        Map<String, long[]> out = new HashMap<>();
        jdbc.query("""
                select ur.role, count(*) filter (where u.status = 'ACTIVE'), count(*)
                  from user_role ur join app_user u on u.id = ur.user_id
                 where u.tenant_id = ? group by ur.role""",
                rs -> {
                    out.put(rs.getString(1), new long[] { rs.getLong(2), rs.getLong(3) });
                }, tenantId);
        return out;
    }

    public long pendingInvitations(UUID tenantId, String role) {
        Long n = jdbc.queryForObject(
                "select count(*) from invitation where tenant_id = ? and role_code = ? and status = 'PENDING'",
                Long.class, tenantId, role);
        return n == null ? 0 : n;
    }
}
