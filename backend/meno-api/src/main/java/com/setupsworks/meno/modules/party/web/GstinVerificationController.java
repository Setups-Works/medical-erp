package com.setupsworks.meno.modules.party.web;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.integrations.api.GstinVerifier.Address;
import com.setupsworks.meno.modules.party.service.GstinVerificationService;
import com.setupsworks.meno.security.PermissionChecker;
import com.setupsworks.meno.security.TenantContext;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** GSTIN fetch for the supplier, customer and company forms (GSTIN_FETCH.md §5). */
@RestController
@RequestMapping(path = "/api/v1/gstin-verifications", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "GSTIN", description = "Verify a GSTIN and fetch its registration details.")
class GstinVerificationController {

    private static final String PROBLEM = "application/problem+json";

    private final GstinVerificationService service;
    private final PermissionChecker permissions;

    GstinVerificationController(GstinVerificationService service, PermissionChecker permissions) {
        this.service = service;
        this.permissions = permissions;
    }

    @Operation(summary = "Verify a GSTIN and fetch its details",
            description = "Format, state, PAN and check character are checked first; only a valid GSTIN is sent to "
                    + "the provider. If the provider is down, enter the details by hand: saving never depends on it.")
    @ApiResponse(responseCode = "200", description = "Details from the GST provider")
    @ApiResponse(responseCode = "403", description = "COMMON_PERMISSION_DENIED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "404", description = "PARTY_GSTIN_NOT_FOUND",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "422", description = "PARTY_GSTIN_INVALID (property failedCheck: FORMAT, STATE, PAN, "
            + "CHECK_CHARACTER)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "429", description = "PARTY_GSTIN_RATE_LIMITED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "503", description = "PARTY_GSTIN_SERVICE_UNAVAILABLE (also when no provider is set)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/{gstin}")
    GstinView verify(@PathVariable String gstin) {
        if (!permissions.has("party.supplier.create") && !permissions.has("party.customer.create")
                && !permissions.has("tenancy.onboarding.manage")) {
            throw new MenoException(HttpStatus.FORBIDDEN, "COMMON_PERMISSION_DENIED",
                    "You don't have permission to do this.");
        }
        var r = service.verify(gstin, TenantContext.requireTenantId(), TenantContext.userId().orElse(null));
        var d = r.details();
        return new GstinView(r.gstin(), d.legalName(), d.tradeName(), d.status(), d.registrationType(),
                d.registeredOn(), d.cancelledOn(), d.constitution(), d.natureOfBusiness(), d.eInvoiceEnabled(),
                r.stateCode(), r.pan(), d.address(), d.source(), d.fetchedAt());
    }

    record GstinView(String gstin, String legalName, String tradeName, String status, String registrationType,
            LocalDate registeredOn, LocalDate cancelledOn, String constitution, List<String> natureOfBusiness,
            boolean eInvoiceEnabled, String stateCode, String pan, Address address, String source,
            Instant fetchedAt) {
    }
}
