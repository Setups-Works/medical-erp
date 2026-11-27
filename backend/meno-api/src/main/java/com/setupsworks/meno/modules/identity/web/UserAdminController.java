package com.setupsworks.meno.modules.identity.web;

import java.util.Set;
import java.util.UUID;

import com.setupsworks.meno.modules.identity.service.UserAdminService;
import com.setupsworks.meno.modules.identity.service.UserAdminService.AccessChange;
import com.setupsworks.meno.modules.identity.service.UserAdminService.StaffUser;
import com.setupsworks.meno.modules.identity.service.UserAdminService.StaffUserPage;
import com.setupsworks.meno.modules.identity.service.UserAdminService.StatusFilter;
import com.setupsworks.meno.modules.identity.service.UserAdminService.UserAdminOptions;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * User management (/admin/users, PLT-06). Tenant from the token only; reads need {@code identity.user.view}, writes
 * {@code identity.user.manage} (checked in the service). Inviting new people stays on {@code /api/v1/team}.
 */
@RestController
@Validated
@RequestMapping(path = "/api/v1/admin/users", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Users", description = "Staff accounts: roles, branch access, deactivate and reactivate.")
class UserAdminController {

    private final UserAdminService service;

    UserAdminController(UserAdminService service) {
        this.service = service;
    }

    @Operation(summary = "Roles (with whether they can be changed here) and the branches you can give access to")
    @GetMapping("/options")
    UserAdminOptions userOptions() {
        return service.options();
    }

    @Operation(summary = "Staff accounts you can see, by name (page envelope)",
            description = "Branch-limited managers see people who share one of their branches, and the owner.")
    @GetMapping
    StaffUserPage listUsers(@RequestParam(required = false) @Size(max = 100) String q,
            @RequestParam(defaultValue = "ACTIVE") StatusFilter status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "50") @Min(1) @Max(200) int size) {
        return service.list(q, status, page, size);
    }

    @Operation(summary = "One staff account")
    @ApiResponse(responseCode = "200", description = "The account")
    @ApiResponse(responseCode = "404", description = "IDENTITY_USER_NOT_FOUND (also another tenant's id)")
    @GetMapping("/{id}")
    StaffUser getUser(@PathVariable UUID id) {
        return service.get(id);
    }

    @Operation(summary = "Change roles and branches",
            description = "Whole sets. Branches are needed unless a role covers every branch. Roles that aren't "
                    + "assignable can't be added or removed. Send the version you loaded.")
    @ApiResponse(responseCode = "200", description = "Saved; takes effect when the person's session refreshes")
    @ApiResponse(responseCode = "400", description = "IDENTITY_ROLE_INVALID, IDENTITY_ROLE_REQUIRED, "
            + "IDENTITY_USER_BRANCH_INVALID, field errors")
    @ApiResponse(responseCode = "404", description = "IDENTITY_USER_NOT_FOUND (also another tenant's id)")
    @ApiResponse(responseCode = "409", description = "COMMON_VERSION_CONFLICT, IDENTITY_LAST_ADMIN")
    @PutMapping("/{id}/access")
    StaffUser changeUserAccess(@PathVariable UUID id, @Valid @RequestBody UserAccessRequest r) {
        return service.changeAccess(id, new AccessChange(r.roleCodes(), r.branchIds(), r.version()));
    }

    @Operation(summary = "Deactivate: the person can't sign in; their history stays")
    @ApiResponse(responseCode = "200", description = "Deactivated")
    @ApiResponse(responseCode = "404", description = "IDENTITY_USER_NOT_FOUND (also another tenant's id)")
    @ApiResponse(responseCode = "409", description = "IDENTITY_CANNOT_DEACTIVATE_SELF, IDENTITY_LAST_ADMIN, "
            + "IDENTITY_USER_ALREADY_INACTIVE")
    @PostMapping("/{id}/deactivate")
    StaffUser deactivateUser(@PathVariable UUID id) {
        return service.deactivate(id);
    }

    @Operation(summary = "Reactivate a deactivated account (also clears a password lockout)")
    @ApiResponse(responseCode = "200", description = "Active again")
    @ApiResponse(responseCode = "404", description = "IDENTITY_USER_NOT_FOUND (also another tenant's id)")
    @ApiResponse(responseCode = "409", description = "IDENTITY_USER_ALREADY_ACTIVE")
    @PostMapping("/{id}/reactivate")
    StaffUser reactivateUser(@PathVariable UUID id) {
        return service.reactivate(id);
    }

    record UserAccessRequest(
            @NotNull @Size(max = 20) Set<@NotBlank @Size(max = 50) String> roleCodes,
            @NotNull @Size(max = 50) Set<@NotNull UUID> branchIds,
            @NotNull @PositiveOrZero Long version) {
    }
}
