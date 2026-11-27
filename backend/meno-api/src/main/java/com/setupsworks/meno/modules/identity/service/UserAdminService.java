package com.setupsworks.meno.modules.identity.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.identity.domain.AppUser;
import com.setupsworks.meno.modules.identity.domain.RoleDefinition;
import com.setupsworks.meno.modules.identity.repository.AppUserRepository;
import com.setupsworks.meno.modules.identity.repository.RoleDefinitionRepository;
import com.setupsworks.meno.modules.identity.service.InvitationService.BranchOption;
import com.setupsworks.meno.modules.tenancy.api.BranchDirectory;
import com.setupsworks.meno.security.PermissionChecker;
import com.setupsworks.meno.security.TenantContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Staff accounts (/admin/users, PLT-06): list, change roles and branches, deactivate and reactivate.
 *
 * <p>Branch scope (ROLES_AND_DASHBOARDS.md): a person whose roles cover every branch ({@code role.all_branches})
 * sees and manages everyone; anyone else sees only people who share one of their branches, plus every-branch people
 * (the owner), and can only hand out branches they have themselves. Roles that aren't {@code invitable} (Business
 * owner, the temporary P1 roles) are shown but can't be granted or taken away here.
 *
 * <p>A tenant always keeps at least one active person who can manage users (identity rule 2): a change that would
 * leave nobody with {@code identity.user.manage} is refused with IDENTITY_LAST_ADMIN.
 */
@Service
public class UserAdminService {

    public static final String VIEW = "identity.user.view";
    public static final String MANAGE = "identity.user.manage";
    private static final Logger log = LoggerFactory.getLogger(UserAdminService.class);

    private final AppUserRepository users;
    private final RoleDefinitionRepository roles;
    private final BranchDirectory branchDirectory;
    private final PermissionChecker permissions;
    private final Clock clock;

    UserAdminService(AppUserRepository users, RoleDefinitionRepository roles, BranchDirectory branchDirectory,
            PermissionChecker permissions, Clock clock) {
        this.users = users;
        this.roles = roles;
        this.branchDirectory = branchDirectory;
        this.permissions = permissions;
        this.clock = clock;
    }

    // ---------------------------------------------------------------- views

    public enum StatusFilter { ACTIVE, DISABLED, ALL }

    public record RoleView(String code, String label) {
    }

    /** {@code assignable}: can be granted / removed on this page; {@code allBranches}: holders see every branch. */
    public record UserRoleOption(String code, String label, boolean assignable, boolean allBranches) {
    }

    /** Roles and the branches the signed-in person may hand out. */
    public record UserAdminOptions(List<UserRoleOption> roles, List<BranchOption> branches) {
    }

    /**
     * One staff account. {@code allBranches} true means the branch list is empty on purpose. {@code you} marks the
     * signed-in person (they can't deactivate themselves). {@code version} goes back with an access change.
     */
    public record StaffUser(UUID id, String fullName, String email, String mobile, AppUser.Status status,
            List<RoleView> roles, List<BranchOption> branches, boolean allBranches, Instant lastLoginAt,
            Instant createdAt, boolean you, long version) {
    }

    /** API_GUIDELINES.md page envelope. */
    public record StaffUserPage(List<StaffUser> items, int page, int size, long totalItems, int totalPages) {
    }

    public record AccessChange(Set<String> roleCodes, Set<UUID> branchIds, long version) {
    }

    // ---------------------------------------------------------------- use cases

    @Transactional(readOnly = true)
    public UserAdminOptions options() {
        permissions.require(VIEW);
        Context ctx = context();
        List<UserRoleOption> roleOptions = ctx.roles().values().stream().filter(r -> !r.isArchived())
                .map(r -> new UserRoleOption(r.getCode(), r.getLabel(), r.isInvitable(), r.isAllBranches()))
                .toList();
        List<BranchOption> branches = ctx.branches().values().stream()
                .filter(b -> ctx.actorAllBranches() || ctx.actorBranches().contains(b.id())).toList();
        return new UserAdminOptions(roleOptions, branches);
    }

    /**
     * People in this tenant the signed-in person may see, by name. A pharmacy's staff list is short (tens), so the
     * scope and search run in memory on one query instead of a per-branch SQL filter.
     */
    @Transactional(readOnly = true)
    public StaffUserPage list(String q, StatusFilter status, int page, int size) {
        permissions.require(VIEW);
        Context ctx = context();
        String needle = q == null || q.isBlank() ? null : q.trim().toLowerCase(Locale.ROOT);
        List<StaffUser> all = users.findByTenantId(ctx.tenantId()).stream()
                .filter(u -> visible(ctx, u))
                .filter(u -> status == StatusFilter.ALL || u.getStatus().name().equals(status.name()))
                .filter(u -> needle == null || matches(u, needle))
                .sorted(Comparator.comparing((AppUser u) -> u.getFullName().toLowerCase(Locale.ROOT))
                        .thenComparing(AppUser::getId))
                .map(u -> view(ctx, u))
                .toList();
        // long maths: page and size come from the query string, and page * size must not wrap to a negative index.
        int from = (int) Math.min((long) page * size, all.size());
        int to = (int) Math.min((long) from + size, all.size());
        int totalPages = (int) (((long) all.size() + size - 1) / size);
        return new StaffUserPage(all.subList(from, to), page, size, all.size(), totalPages);
    }

    @Transactional(readOnly = true)
    public StaffUser get(UUID id) {
        permissions.require(VIEW);
        Context ctx = context();
        AppUser user = users.findByIdAndTenantId(id, ctx.tenantId()).filter(u -> visible(ctx, u))
                .orElseThrow(UserAdminService::notFound);
        return view(ctx, user);
    }

    @Transactional
    public StaffUser changeAccess(UUID id, AccessChange change) {
        permissions.require(MANAGE);
        Context ctx = context();
        AppUser user = manageable(ctx, id);
        if (user.getVersion() != change.version()) {
            throw versionConflict();
        }
        Set<String> wanted = new LinkedHashSet<>(change.roleCodes());
        Set<String> touched = new HashSet<>(wanted);
        touched.addAll(user.getRoles());
        touched.removeIf(code -> wanted.contains(code) && user.getRoles().contains(code));
        for (String code : touched) {
            RoleDefinition role = ctx.roles().get(code);
            boolean addingArchived = role != null && role.isArchived() && wanted.contains(code);
            if (role == null || !role.isInvitable() || addingArchived) {
                throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_ROLE_INVALID",
                        role == null ? "Choose a role from the list." : role.getLabel() + " can't be changed here.");
            }
        }
        if (wanted.isEmpty()) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_ROLE_REQUIRED", "Choose at least one role.");
        }
        boolean coversAll = wanted.stream().map(ctx.roles()::get).anyMatch(RoleDefinition::isAllBranches);
        Set<UUID> branchIds = coversAll ? Set.of() : change.branchIds();
        if (!coversAll) {
            boolean allowed = !branchIds.isEmpty() && ctx.branches().keySet().containsAll(branchIds)
                    && (ctx.actorAllBranches() || ctx.actorBranches().containsAll(branchIds));
            if (!allowed) {
                // Another tenant's branch id looks exactly like a missing one.
                throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_USER_BRANCH_INVALID",
                        "Choose at least one of your branches.");
            }
        }
        user.changeAccess(wanted, branchIds, ctx.actorId(), clock.instant());
        users.flush();
        requireSomeoneCanManage(ctx.tenantId(), "This is the last person who can manage users. "
                + "Give another active person that access first.");
        log.info("User {} access changed in tenant {} to roles {}", user.getId(), ctx.tenantId(), wanted);
        return view(ctx, user);
    }

    @Transactional
    public StaffUser deactivate(UUID id) {
        permissions.require(MANAGE);
        Context ctx = context();
        AppUser user = manageable(ctx, id);
        if (user.getId().equals(ctx.actorId())) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_CANNOT_DEACTIVATE_SELF",
                    "You can't deactivate your own account.");
        }
        if (!user.isActive()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_USER_ALREADY_INACTIVE",
                    "This account is already deactivated.");
        }
        user.deactivate(ctx.actorId(), clock.instant());
        users.flush();
        requireSomeoneCanManage(ctx.tenantId(), "This is the last person who can manage users, so the account "
                + "can't be deactivated.");
        // Refresh refuses a deactivated user (CredentialCheck.findSignInAllowed), so open sessions end when their
        // access token expires.
        log.info("User {} deactivated in tenant {}", user.getId(), ctx.tenantId());
        return view(ctx, user);
    }

    @Transactional
    public StaffUser reactivate(UUID id) {
        permissions.require(MANAGE);
        Context ctx = context();
        AppUser user = manageable(ctx, id);
        if (user.isActive()) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_USER_ALREADY_ACTIVE", "This account is active.");
        }
        user.reactivate(ctx.actorId(), clock.instant());
        users.flush(); // so the response carries the new version
        log.info("User {} reactivated in tenant {}", user.getId(), ctx.tenantId());
        return view(ctx, user);
    }

    // ---------------------------------------------------------------- helpers

    /**
     * What the signed-in person can see. {@code roles} is every role in display order; {@code branches} every branch
     * of the tenant.
     */
    private record Context(UUID tenantId, UUID actorId, boolean actorAllBranches, Set<UUID> actorBranches,
            Map<String, RoleDefinition> roles, Map<UUID, BranchOption> branches) {
    }

    private Context context() {
        UUID tenantId = TenantContext.requireTenantId();
        UUID actorId = TenantContext.userId().orElse(null);
        // Archived roles stay in the map so people who still hold one show its name; options leave them out.
        Map<String, RoleDefinition> roleMap = roles.findAllForTenant(tenantId).stream()
                .collect(Collectors.toMap(RoleDefinition::getCode, Function.identity(), (a, b) -> a,
                        LinkedHashMap::new));
        Map<UUID, BranchOption> branches = branchDirectory.branches(tenantId).stream()
                .map(b -> new BranchOption(b.id(), b.name(), b.code(), b.headOffice()))
                .collect(Collectors.toMap(BranchOption::id, Function.identity(), (a, b) -> a, LinkedHashMap::new));
        AppUser actor = actorId == null ? null : users.findByIdAndTenantId(actorId, tenantId).orElse(null);
        boolean actorAll = actor != null && coversAll(actor, roleMap);
        Set<UUID> actorBranches = actor == null ? Set.of() : actor.getBranchIds();
        return new Context(tenantId, actorId, actorAll, actorBranches, roleMap, branches);
    }

    private static boolean coversAll(AppUser user, Map<String, RoleDefinition> roleMap) {
        return user.getRoles().stream().map(roleMap::get).filter(Objects::nonNull)
                .anyMatch(RoleDefinition::isAllBranches);
    }

    private static boolean visible(Context ctx, AppUser u) {
        return ctx.actorAllBranches() || u.getId().equals(ctx.actorId()) || coversAll(u, ctx.roles())
                || u.getBranchIds().stream().anyMatch(ctx.actorBranches()::contains);
    }

    /** Branch-limited managers can't touch every-branch people (the owner) or people outside their branches. */
    private AppUser manageable(Context ctx, UUID id) {
        AppUser user = users.findByIdAndTenantId(id, ctx.tenantId()).filter(u -> visible(ctx, u))
                .orElseThrow(UserAdminService::notFound);
        if (!ctx.actorAllBranches() && !user.getId().equals(ctx.actorId()) && coversAll(user, ctx.roles())) {
            throw new MenoException(HttpStatus.FORBIDDEN, "COMMON_PERMISSION_DENIED",
                    "You don't have permission to do this.");
        }
        return user;
    }

    /** Someone active must still be able to manage users and roles (identity rule 2). */
    private void requireSomeoneCanManage(UUID tenantId, String message) {
        if (users.countActiveWithPermission(tenantId, MANAGE) == 0
                || users.countActiveWithPermission(tenantId, RoleAdminService.MANAGE) == 0) {
            throw new MenoException(HttpStatus.CONFLICT, "IDENTITY_LAST_ADMIN", message);
        }
    }

    private static boolean matches(AppUser u, String needle) {
        return u.getFullName().toLowerCase(Locale.ROOT).contains(needle) || u.getEmail().contains(needle)
                || (u.getMobile() != null && u.getMobile().replace("+91", "").contains(needle.replaceAll("\\s", "")));
    }

    private static StaffUser view(Context ctx, AppUser u) {
        List<RoleView> roleViews = ctx.roles().values().stream().filter(r -> u.getRoles().contains(r.getCode()))
                .map(r -> new RoleView(r.getCode(), r.getLabel())).toList();
        boolean all = coversAll(u, ctx.roles());
        List<BranchOption> branches = all ? List.of()
                : ctx.branches().values().stream().filter(b -> u.getBranchIds().contains(b.id())).toList();
        return new StaffUser(u.getId(), u.getFullName(), u.getEmail(), u.getMobile(), u.getStatus(), roleViews,
                branches, all, u.getLastLoginAt(), u.getCreatedAt(), u.getId().equals(ctx.actorId()),
                u.getVersion());
    }

    private static MenoException notFound() {
        return new MenoException(HttpStatus.NOT_FOUND, "IDENTITY_USER_NOT_FOUND", "User not found.");
    }

    private static MenoException versionConflict() {
        return new MenoException(HttpStatus.CONFLICT, "COMMON_VERSION_CONFLICT",
                "Someone else changed this just now. Reload to see the latest and try again.");
    }
}
