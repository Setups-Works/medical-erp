package com.setupsworks.meno.modules.identity.web;

import java.util.List;
import java.util.Set;

import com.setupsworks.meno.common.web.Versions;
import com.setupsworks.meno.modules.identity.service.RoleAdminService;
import com.setupsworks.meno.modules.identity.service.RoleAdminService.NewRole;
import com.setupsworks.meno.modules.identity.service.RoleAdminService.PermissionChange;
import com.setupsworks.meno.modules.identity.service.RoleAdminService.RoleDetail;
import com.setupsworks.meno.modules.identity.service.RoleAdminService.RoleRename;
import com.setupsworks.meno.modules.identity.service.RoleAdminService.RoleSummary;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Role management (/admin/roles, PLT-07). Tenant from the token only; reads need {@code identity.role.view}, writes
 * {@code identity.role.manage} (checked in the service). Another tenant's role code answers 404.
 */
@RestController
@Validated
@RequestMapping(path = "/api/v1/admin/roles", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Roles", description = "MENO's default roles and your own: names, permissions, reset, archive.")
class RoleAdminController {

    private static final String NO_CONTROL = "[^\\p{Cntrl}]*";
    private static final String PERMISSION = "^[a-z]+(\\.[a-z-]+){2}$";

    private final RoleAdminService service;

    RoleAdminController(RoleAdminService service) {
        this.service = service;
    }

    @Operation(summary = "Roles: defaults first, then your own, with how many people hold each")
    @GetMapping
    List<RoleSummary> listRoles() {
        return service.list();
    }

    @Operation(summary = "One role with its permissions")
    @ApiResponse(responseCode = "200", description = "The role; ETag = the role's version (name). The permission "
            + "list has its own version, permissionsVersion, for PUT {code}/permissions.")
    @ApiResponse(responseCode = "404", description = "IDENTITY_ROLE_NOT_FOUND (also another tenant's role)")
    @GetMapping("/{code}")
    ResponseEntity<RoleDetail> getRole(@PathVariable String code) {
        RoleDetail role = service.get(code);
        return ResponseEntity.ok().header(HttpHeaders.ETAG, Versions.etag(role.version())).body(role);
    }

    @Operation(summary = "Create your own role", description = "Empty, or starting with another role's permissions.")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "404", description = "IDENTITY_ROLE_NOT_FOUND (copyFrom)")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ROLE_NAME_TAKEN")
    @PostMapping
    ResponseEntity<RoleDetail> createRole(@Valid @RequestBody NewRoleRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(new NewRole(r.label(), r.description(), r.copyFrom())));
    }

    @Operation(summary = "Rename your own role", description = "If-Match: the role's version.")
    @ApiResponse(responseCode = "200", description = "Saved")
    @ApiResponse(responseCode = "404", description = "IDENTITY_ROLE_NOT_FOUND")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ROLE_NOT_EDITABLE (default role), "
            + "IDENTITY_ROLE_NAME_TAKEN, COMMON_VERSION_CONFLICT")
    @ApiResponse(responseCode = "428", description = "COMMON_PRECONDITION_REQUIRED (no If-Match)")
    @PutMapping("/{code}")
    RoleDetail renameRole(@PathVariable String code,
            @RequestHeader(value = HttpHeaders.IF_MATCH, required = false) String ifMatch,
            @Valid @RequestBody RenameRoleRequest r) {
        return service.rename(code, new RoleRename(r.label(), r.description(), Versions.fromIfMatch(ifMatch)));
    }

    @Operation(summary = "Set the role's permissions (whole list)",
            description = "If-Match: permissionsVersion (0 while a default role still has MENO's list). For a default "
                    + "role this makes your own copy of its list; reset brings MENO's back.")
    @ApiResponse(responseCode = "200", description = "Saved; applies within 30 seconds")
    @ApiResponse(responseCode = "400", description = "IDENTITY_PERMISSION_INVALID, field errors")
    @ApiResponse(responseCode = "404", description = "IDENTITY_ROLE_NOT_FOUND")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ROLE_LOCKED, IDENTITY_LAST_ADMIN, "
            + "COMMON_VERSION_CONFLICT")
    @ApiResponse(responseCode = "428", description = "COMMON_PRECONDITION_REQUIRED (no If-Match)")
    @PutMapping("/{code}/permissions")
    RoleDetail setRolePermissions(@PathVariable String code,
            @RequestHeader(value = HttpHeaders.IF_MATCH, required = false) String ifMatch,
            @Valid @RequestBody RolePermissionsRequest r) {
        return service.changePermissions(code, new PermissionChange(r.permissionCodes(),
                Versions.fromIfMatch(ifMatch)));
    }

    @Operation(summary = "Give a default role MENO's permissions back")
    @ApiResponse(responseCode = "200", description = "Reset")
    @ApiResponse(responseCode = "404", description = "IDENTITY_ROLE_NOT_FOUND")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ROLE_LOCKED, IDENTITY_ROLE_NOT_EDITABLE (own role), "
            + "IDENTITY_LAST_ADMIN")
    @PostMapping("/{code}/reset")
    RoleDetail resetRole(@PathVariable String code) {
        return service.resetToDefaults(code);
    }

    @Operation(summary = "Remove your own role", description = "Archived, so old records keep its name. Refused "
            + "while active people hold it or open invitations carry it.")
    @ApiResponse(responseCode = "204", description = "Archived")
    @ApiResponse(responseCode = "404", description = "IDENTITY_ROLE_NOT_FOUND")
    @ApiResponse(responseCode = "409", description = "IDENTITY_ROLE_NOT_EDITABLE (default role), IDENTITY_ROLE_IN_USE")
    @DeleteMapping("/{code}")
    ResponseEntity<Void> archiveRole(@PathVariable String code) {
        service.archive(code);
        return ResponseEntity.noContent().build();
    }

    record NewRoleRequest(
            @NotBlank @Size(max = 60) @Pattern(regexp = NO_CONTROL) String label,
            @Size(max = 300) @Pattern(regexp = NO_CONTROL) String description,
            @Size(max = 50) String copyFrom) {
    }

    record RenameRoleRequest(
            @NotBlank @Size(max = 60) @Pattern(regexp = NO_CONTROL) String label,
            @Size(max = 300) @Pattern(regexp = NO_CONTROL) String description) {
    }

    record RolePermissionsRequest(
            @NotNull @Size(max = 500) Set<@NotBlank @Pattern(regexp = PERMISSION) String> permissionCodes) {
    }
}
