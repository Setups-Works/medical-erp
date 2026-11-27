package com.setupsworks.meno.modules.platform.web;

import java.util.List;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.platform.api.ReferenceLookup;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** PIN code and IFSC lookups for address and bank forms (PLT-22). Any signed-in tenant user. */
@RestController
@RequestMapping(path = "/api/v1/reference", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Reference data", description = "Shared lists (PIN codes, IFSC). 404 when unknown or not loaded yet.")
class ReferenceLookupController {

    private static final String PROBLEM = "application/problem+json";

    private final ReferenceLookup lookup;

    ReferenceLookupController(ReferenceLookup lookup) {
        this.lookup = lookup;
    }

    record PincodeInfo(String pincode, String stateCode, String district, List<String> localities) {
    }

    record IfscInfo(String ifsc, String bank, String branch, String address, String city, String district,
            String state) {
    }

    @Operation(summary = "State, district and localities for a PIN code")
    @ApiResponse(responseCode = "200", description = "Found")
    @ApiResponse(responseCode = "404", description = "REFERENCE_PINCODE_NOT_FOUND",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/pincodes/{pincode}")
    PincodeInfo lookupPincode(@PathVariable @Pattern(regexp = "^[1-9][0-9]{5}$") String pincode) {
        return lookup.pincode(pincode)
                .map(p -> new PincodeInfo(p.pincode(), p.stateCode(), p.district(), p.localities()))
                .orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND, "REFERENCE_PINCODE_NOT_FOUND",
                        "We don't know this PIN code. Type the district and city."));
    }

    @Operation(summary = "Bank and branch for an IFSC")
    @ApiResponse(responseCode = "200", description = "Found")
    @ApiResponse(responseCode = "404", description = "REFERENCE_IFSC_NOT_FOUND",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @GetMapping("/ifsc/{ifsc}")
    IfscInfo lookupIfsc(@PathVariable @Pattern(regexp = "^[A-Za-z]{4}0[A-Za-z0-9]{6}$") String ifsc) {
        return lookup.ifsc(ifsc)
                .map(i -> new IfscInfo(i.ifsc(), i.bank(), i.branch(), i.address(), i.city(), i.district(), i.state()))
                .orElseThrow(() -> new MenoException(HttpStatus.NOT_FOUND, "REFERENCE_IFSC_NOT_FOUND",
                        "We don't know this IFSC. Check it, or type the bank and branch."));
    }
}
