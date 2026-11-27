package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.domain.RoleDefinition;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.identity.repository.RoleDefinitionRepository;
import com.setupsworks.meno.modules.identity.repository.RolePermissionStore;
import com.setupsworks.meno.modules.identity.repository.RolePermissionStore.ListOwnership;
import com.setupsworks.meno.security.PermissionChecker;
import com.setupsworks.meno.security.TenantContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Roles per tenant (/admin/roles, PLT-07; ROLES_AND_DASHBOARDS.md "A role is a bundle of permissions … each tenant
 * can edit them or create new ones").
 *
 * <ul>
 * <li>MENO's default roles are shared: a tenant can change a default role's permissions (it then owns that list,
 * {@code role_override}) and reset it later, but not rename or archive it.</li>
 * <li>Custom roles belong to one tenant: create (empty or copied from another role), rename, change permissions,
 * archive once nobody active holds it and no open invitation carries it.</li>
 * <li>Locked roles (the Business owner) can't be changed at all.</li>
 * <li>After any change, someone active must still hold {@code identity.user.manage} and {@code identity.role.manage}
 * (identity rule 2), or the change is refused with IDENTITY_LAST_ADMIN.</li>
 * </ul>
 */
@Service
public class RoleAdminService {

    public static final String VIEW = "identity.role.view";
    public static final String MANAGE = "identity.role.manage";
    private static final Logger log = LoggerFactory.getLogger(RoleAdminService.class);

    private final RoleDefinitionRepository roles;
    private final RolePermissionStore store;
    private final AppUserRepository users;
    private final PermissionChecker permissions;
    private final Clock clock;

    RoleAdminService(RoleDefinitionRepository roles, RolePermissionStore store, AppUserRepository users,
            PermissionChecker permissions, Clock clock) {
        this.roles = roles;
        this.store = store;
        this.permissions = permissions;
        this.users = users;
        this.clock = clock;
    }

    // ---------------------------------------------------------------- views

    /**
     * One role in the list. {@code custom}: the tenant's own; {@code customised}: a default role whose permissions
     * this tenant changed; {@code locked}: can't be changed. {@code activeUsers} / {@code totalUsers} count people
     * holding it.
     */
    public record RoleSummary(String code, String label, String description, boolean custom, boolean customised,
            boolean locked, boolean allBranches, int permissionCount, long activeUsers, long totalUsers) {
    }

    /** {@code version}: the role row (rename); {@code permissionsVersion}: the tenant's list (0 = still defaults). */
    public record RoleDetail(String code, String label, String description, boolean custom, boolean customised,
            boolean locked, boolean allBranches, List<String> permissionCodes, long activeUsers, long totalUsers,
            long version, long permissionsVersion) {
    }

    /** A permission and the visible roles that hold it for this tenant. */
    public record PermissionEntry(String code, String description, List<String> roleCodes) {
    }

    public record PermissionModule(String code, String label, List<PermissionEntry> permissions) {
    }

    public record RoleColumn(String code, String label, boolean custom, boolean locked) {
    }

    /** Every permission grouped by module, with who holds it; the roles in display order (matrix columns). */
    public record PermissionCatalogue(List<PermissionModule> modules, List<RoleColumn> roles) {
    }

    public record NewRole(String label, String description, String copyFrom) {
    }

    public record RoleRename(String label, String description, long version) {
    }

    public record PermissionChange(Set<String> permissionCodes, long permissionsVersion) {
    }

    // ---------------------------------------------------------------- use cases

    @Transactional(readOnly = true)
    public List<RoleSummary> list() {
        permissions.require(VIEW);
        UUID tenantId = TenantContext.requireTenantId();
        List<RoleDefinition> visible = roles.findVisible(tenantId);
        Map<String, Set<String>> effective = store.effective(tenantId, visible.stream().map(RoleDefinition::getCode)
                .toList());
        Map<String, ListOwnership> overrides = store.overrides(tenantId);
        Map<String, long[]> holders = store.holders(tenantId);
        return visible.stream().map(r -> {
            long[] h = holders.getOrDefault(r.getCode(), new long[2]);
            return new RoleSummary(r.getCode(), r.getLabel(), r.getDescription(), r.isCustom(),
                    !r.isCustom() && overrides.containsKey(r.getCode()), r.isLocked(), r.isAllBranches(),
                    effective.get(r.getCode()).size(), h[0], h[1]);
        }).toList();
    }

    @Transactional(readOnly = true)
    public PermissionCatalogue catalogue() {
        permissions.require(VIEW);
        UUID tenantId = TenantContext.requireTenantId();
        List<RoleDefinition> visible = roles.findVisible(tenantId);
        Map<String, Set<String>> effective = store.effective(tenantId, visible.stream().map(RoleDefinition::getCode)
                .toList());
        Map<String, PermissionModule> modules = new java.util.LinkedHashMap<>();
        for (RolePermissionStore.CatalogueEntry e : store.catalogue()) {
            List<String> holders = visible.stream().map(RoleDefinition::getCode)
                    .filter(c -> effective.get(c).contains(e.code())).toList();
            modules.computeIfAbsent(e.moduleCode(), m -> new PermissionModule(m, e.moduleLabel(),
                    new java.util.ArrayList<>())).permissions().add(new PermissionEntry(e.code(), e.description(),
                            holders));
        }
        List<RoleColumn> columns = visible.stream()
                .map(r -> new RoleColumn(r.getCode(), r.getLabel(), r.isCustom(), r.isLocked())).toList();
        return new PermissionCatalogue(List.copyOf(modules.values()), columns);
    }

    @Transactional(readOnly = true)
    public RoleDetail get(String code) {
        permissions.require(VIEW);
        UUID tenantId = TenantContext.requireTenantId();
        return detail(tenantId, visible(tenantId, code));
    }

    @Transactional
    public RoleDetail create(NewRole cmd) {
        permissions.require(MANAGE);
        UUID tenantId = TenantContext.requireTenantId();
        String label = cmd.label().trim();
        requireFreeLabel(tenantId, label, "");
        Set<String> start = cmd.copyFrom() == null || cmd.copyFrom().isBlank() ? Set.of()
                : store.effective(tenantId, visible(tenantId, cmd.copyFrom()).getCode());
        Instant now = clock.instant();
        UUID by = TenantContext.userId().orElse(null);
        RoleDefinition role = roles.saveAndFlush(RoleDefinition.custom(newCode(), tenantId, label,
                blankToNull(cmd.description()), by, now));
        store.replace(tenantId, role.getCode(), start, by, now);
        evictAfterCommit(tenantId);
        log.info("Role {} created in tenant {} with {} permissions", role.getCode(), tenantId, start.size());
        return detail(tenantId, role);
    }

    @Transactional
    public RoleDetail rename(String code, RoleRename cmd) {
        permissions.require(MANAGE);
        UUID tenantId = TenantContext.requireTenantId();
        RoleDefinition role = visible(tenantId, code);
        if (!role.isCustom()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_ROLE_NOT_EDITABLE",
                    "MENO's default roles keep their names. Create your own role to use another name.");
        }
        if (role.getVersion() != cmd.version()) {
            throw versionConflict();
        }
        String label = cmd.label().trim();
        requireFreeLabel(tenantId, label, code);
        role.rename(label, blankToNull(cmd.description()), TenantContext.userId().orElse(null), clock.instant());
        roles.flush();
        return detail(tenantId, role);
    }

    @Transactional
    public RoleDetail changePermissions(String code, PermissionChange cmd) {
        permissions.require(MANAGE);
        UUID tenantId = TenantContext.requireTenantId();
        RoleDefinition role = editable(tenantId, code);
        long current = store.override(tenantId, code).map(ListOwnership::version).orElse(0L);
        if (current != cmd.permissionsVersion()) {
            throw versionConflict();
        }
        Set<String> wanted = new TreeSet<>(cmd.permissionCodes());
        Set<String> unknown = new TreeSet<>(wanted);
        unknown.removeAll(store.knownPermissions());
        if (!unknown.isEmpty()) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_PERMISSION_INVALID",
                    "Choose permissions from the list.");
        }
        store.replace(tenantId, code, wanted, TenantContext.userId().orElse(null), clock.instant());
        requireAdminsRemain(tenantId);
        evictAfterCommit(tenantId);
        log.info("Role {} permissions changed in tenant {} ({} permissions)", code, tenantId, wanted.size());
        return detail(tenantId, role);
    }

    /** A default role goes back to MENO's list (and follows future default changes again). */
    @Transactional
    public RoleDetail resetToDefaults(String code) {
        permissions.require(MANAGE);
        UUID tenantId = TenantContext.requireTenantId();
        RoleDefinition role = editable(tenantId, code);
        if (role.isCustom()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_ROLE_NOT_EDITABLE",
                    "Only MENO's default roles can be reset.");
        }
        store.reset(tenantId, code);
        requireAdminsRemain(tenantId);
        evictAfterCommit(tenantId);
        return detail(tenantId, role);
    }

    @Transactional
    public void archive(String code) {
        permissions.require(MANAGE);
        UUID tenantId = TenantContext.requireTenantId();
        RoleDefinition role = visible(tenantId, code);
        if (!role.isCustom()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_ROLE_NOT_EDITABLE",
                    "MENO's default roles can't be removed.");
        }
        long active = store.holders(tenantId).getOrDefault(code, new long[2])[0];
        if (active > 0 || store.pendingInvitations(tenantId, code) > 0) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_ROLE_IN_USE",
                    "People still have this role or are invited with it. Give them another role first.");
        }
        role.archive(TenantContext.userId().orElse(null), clock.instant());
        evictAfterCommit(tenantId);
        log.info("Role {} archived in tenant {}", code, tenantId);
    }

    // ---------------------------------------------------------------- helpers

    private RoleDefinition visible(UUID tenantId, String code) {
        return roles.findVisible(tenantId, code).orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND,
                "IDENTITY_ROLE_NOT_FOUND", "Role not found."));
    }

    private RoleDefinition editable(UUID tenantId, String code) {
        RoleDefinition role = visible(tenantId, code);
        if (role.isLocked()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_ROLE_LOCKED",
                    role.getLabel() + " always has every permission, so it can't be changed.");
        }
        return role;
    }

    private RoleDetail detail(UUID tenantId, RoleDefinition r) {
        Set<String> perms = store.effective(tenantId, r.getCode());
        long overrideVersion = store.override(tenantId, r.getCode()).map(ListOwnership::version).orElse(0L);
        long[] h = store.holders(tenantId).getOrDefault(r.getCode(), new long[2]);
        return new RoleDetail(r.getCode(), r.getLabel(), r.getDescription(), r.isCustom(),
                !r.isCustom() && overrideVersion > 0, r.isLocked(), r.isAllBranches(), List.copyOf(perms), h[0], h[1],
                r.getVersion(), overrideVersion);
    }

    private void requireFreeLabel(UUID tenantId, String label, String exceptCode) {
        if (roles.labelTaken(tenantId, label, exceptCode)) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_ROLE_NAME_TAKEN",
                    "A role with this name already exists.");
        }
    }

    /** Checked after the change is written, inside the transaction, so a refusal rolls everything back. */
    void requireAdminsRemain(UUID tenantId) {
        users.flush();
        for (String perm : List.of(UserAdminService.MANAGE, MANAGE)) {
            if (users.countActiveWithPermission(tenantId, perm) == 0) {
                throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_LAST_ADMIN",
                        "Nobody active would be left who can manage users and roles. Keep that access on at least "
                                + "one role someone holds.");
            }
        }
    }

    void evictAfterCommit(UUID tenantId) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    permissions.evictTenant(tenantId);
                }
            });
        } else {
            permissions.evictTenant(tenantId);
        }
    }

    /** Custom role codes are generated (people only ever see the label); unique across tenants because code is the PK. */
    private static String newCode() {
        byte[] b = new byte[6];
        new java.security.SecureRandom().nextBytes(b);
        return "CUSTOM_" + HexFormat.of().withUpperCase().formatHex(b);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static MenoException versionConflict() {
        return new MenoException(HttpStatus.CONFLICT, "COMMON_VERSION_CONFLICT",
                "Someone else changed this just now. Reload to see the latest and try again.");
    }
}
