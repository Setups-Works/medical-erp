package com.setupsworks.meno.modules.identity.web;

import com.setupsworks.meno.modules.identity.service.RoleAdminService;
import com.setupsworks.meno.modules.identity.service.RoleAdminService.PermissionCatalogue;
import com.setupsworks.meno.modules.identity.service.RoleAdminService.PermissionEntry;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Permission catalogue (PLT-07): every {@code module.resource.action} grouped by module with the roles holding it.
 * Read by the role editor (/admin/roles) and the permission matrix (/admin/permissions). Needs
 * {@code identity.role.view}; giving or taking one permission from one role needs {@code identity.role.manage}
 * (checked in the service).
 */
@RestController
@RequestMapping(path = "/api/v1/admin/permissions", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Permissions", description = "What each role may do, permission by permission.")
class PermissionAdminController {

    private final RoleAdminService service;

    PermissionAdminController(RoleAdminService service) {
        this.service = service;
    }

    @Operation(summary = "Every permission by module, with the roles that hold it for your business")
    @GetMapping
    PermissionCatalogue permissionCatalogue() {
        return service.catalogue();
    }

    @Operation(summary = "Give a role this permission", description = "Idempotent. For a default role this makes "
            + "your own copy of its list (reset it on the role page).")
    @ApiResponse(responseCode = "200", description = "The permission with the roles that hold it now")
    @ApiResponse(responseCode = "404", description = "IDENTITY_PERMISSION_NOT_FOUND, IDENTITY_ROLE_NOT_FOUND "
            + "(also another tenant's role)")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ROLE_LOCKED")
    @PutMapping("/{permission}/roles/{role}")
    PermissionEntry grantPermission(@PathVariable String permission, @PathVariable String role) {
        return service.setGrant(permission, role, true);
    }

    @Operation(summary = "Take this permission from a role", description = "Idempotent.")
    @ApiResponse(responseCode = "200", description = "The permission with the roles that hold it now")
    @ApiResponse(responseCode = "404", description = "IDENTITY_PERMISSION_NOT_FOUND, IDENTITY_ROLE_NOT_FOUND")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ROLE_LOCKED, IDENTITY_LAST_ADMIN")
    @DeleteMapping("/{permission}/roles/{role}")
    PermissionEntry revokePermission(@PathVariable String permission, @PathVariable String role) {
        return service.setGrant(permission, role, false);
    }
}
