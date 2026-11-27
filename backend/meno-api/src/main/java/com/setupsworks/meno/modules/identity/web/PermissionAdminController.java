package com.setupsworks.meno.modules.identity.web;

import com.setupsworks.meno.modules.identity.service.RoleAdminService;
import com.setupsworks.meno.modules.identity.service.RoleAdminService.PermissionCatalogue;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Permission catalogue (PLT-07): every {@code module.resource.action} grouped by module with the roles holding it.
 * Read by the role editor (/admin/roles) and the permission matrix (/admin/permissions). Needs
 * {@code identity.role.view} (checked in the service).
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
}
