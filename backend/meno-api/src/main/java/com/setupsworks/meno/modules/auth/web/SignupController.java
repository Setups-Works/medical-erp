package com.setupsworks.meno.modules.auth.web;

import java.util.UUID;

import com.setupsworks.meno.common.error.MenoException;
import com.setupsworks.meno.modules.auth.service.AuthService;
import com.setupsworks.meno.modules.identity.api.SignupFacade;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sign-up step 1 (AUT-04, PLT-01, docs/product/ONBOARDING.md): creates the tenant and its owner, then signs the
 * owner in exactly like login (access token in the body, refresh token in the meno_refresh cookie).
 */
@RestController
@RequestMapping(path = "/api/v1/auth/signup", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Sign-up", description = "Create a pharmacy business (tenant) and its owner account.")
class SignupController {

    private static final String PROBLEM = "application/problem+json";

    private final SignupFacade signup;
    private final AuthService authService;
    private final SessionResponses responses;

    SignupController(SignupFacade signup, AuthService authService, SessionResponses responses) {
        this.signup = signup;
        this.authService = authService;
        this.responses = responses;
    }

    @Operation(summary = "Options for the sign-up screen",
            description = "States (GST codes), start options, the current terms version and the password minimum. "
                    + "The screen never hard-codes these lists.")
    @SecurityRequirements
    @ApiResponse(responseCode = "200", description = "Options")
    @GetMapping("/options")
    SignupFacade.Options options() {
        return signup.options();
    }

    @Operation(summary = "Sign up a new pharmacy business",
            description = "Creates the tenant, its OWNER user and the terms/privacy consent in one transaction, then "
                    + "signs the owner in. Send an Idempotency-Key (UUID): repeating the request with the same key "
                    + "returns the same account instead of a duplicate.")
    @SecurityRequirements
    @ApiResponse(responseCode = "201", description = "Created and signed in (same body as login)")
    @ApiResponse(responseCode = "200", description = "Replay of an earlier sign-up with the same Idempotency-Key")
    @ApiResponse(responseCode = "400", description = "Field errors, IDENTITY_PASSWORD_TOO_SHORT, "
            + "IDENTITY_START_OPTION_INVALID, IDENTITY_TERMS_NOT_ACCEPTED, TENANCY_STATE_UNKNOWN, "
            + "IDENTITY_SIGNUP_REJECTED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "403", description = "IDENTITY_SIGNUP_CLOSED",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "409", description = "IDENTITY_EMAIL_TAKEN",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @ApiResponse(responseCode = "422", description = "COMMON_IDEMPOTENCY_MISMATCH (key used for another sign-up)",
            content = @Content(mediaType = PROBLEM, schema = @Schema(implementation = ProblemDetail.class)))
    @PostMapping
    ResponseEntity<SessionResponses.TokenResponse> signUp(@Valid @RequestBody SignupRequest request,
            @Parameter(description = "Client-generated UUID; repeat it when retrying the same sign-up")
            @RequestHeader(name = "Idempotency-Key", required = false) UUID idempotencyKey,
            HttpServletRequest http) {
        // Honeypot: the field is hidden on the screen, so only bots fill it (ONBOARDING.md anti-abuse).
        if (request.website() != null && !request.website().isBlank()) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "IDENTITY_SIGNUP_REJECTED",
                    "We couldn't create the account. Please try again.");
        }
        var outcome = signup.signUp(new SignupFacade.Command(request.ownerName(), request.mobile(), request.email(),
                request.password(), request.businessName(), request.stateCode(), request.partnerCode(),
                request.startWith(), request.acceptedTermsVersion()), idempotencyKey);
        var result = authService.startSession(outcome.account(), SessionResponses.clientInfo(http));
        return responses.withRefreshCookie(result, outcome.replayed() ? HttpStatus.OK : HttpStatus.CREATED);
    }

    /** Field rules from ONBOARDING.md step 1 and VALIDATION_AND_BUSINESS_RULES.md (names, phone, email). */
    record SignupRequest(
            @NotBlank @Size(max = 100) @Pattern(regexp = "[^\\p{Cntrl}]*") String ownerName,
            @NotBlank @Pattern(regexp = "[6-9][0-9]{9}", message = "must be 10 digits starting with 6-9")
            String mobile,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 128) String password,
            @NotBlank @Size(max = 200) @Pattern(regexp = "[^\\p{Cntrl}]*") String businessName,
            @NotBlank @Pattern(regexp = "[0-9]{2}", message = "must be a 2-digit GST state code") String stateCode,
            @Size(max = 40) @Pattern(regexp = "[A-Za-z0-9-]*") String partnerCode,
            @NotBlank @Size(max = 40) String startWith,
            @NotBlank @Size(max = 40) String acceptedTermsVersion,
            @Schema(description = "Leave empty (bot trap)") String website) {
    }
}
