/**
 * TEMPORARY corrections for gaps in the springdoc output of meno-api (contracts/openapi/meno-api.yaml), so the
 * typed client matches what the controllers really return. Each line names the backend fix; once it is made and
 * the spec regenerated, delete the line here.
 *
 * Gaps found 26-11-2026 on feature/7-tenancy-onboarding:
 * 1. Several handlers declare only their error @ApiResponse, so springdoc drops the 200 body
 *    → add @ApiResponse(responseCode = "200") to PUT business/company/licences/books/configuration, POST go-live,
 *      POST steps/{step}/skip and GET branches/{id}.
 * 2. GET company / books answer 200 with a body or 204 when empty, but the spec lists only 204.
 * 3. SignupFacade.Options and OnboardingService.Options share the schema name "Options"; springdoc kept only the
 *    onboarding one → annotate the sign-up record with @Schema(name = "SignupOptions").
 * 4. Branch.Details and Company.Details share the name "Details", so BranchView.details / Branches.suggestion are
 *    typed as the company record → annotate Branch.Details with @Schema(name = "BranchDetails").
 */
import type { components } from "./generated/meno-api";

type S = components["schemas"];

/** Shape of SignupFacade.Options (identity module). */
export type SignupOptions = {
  open: boolean;
  states: { code: string; name: string; kind: string }[];
  startOptions: string[];
  termsVersion: string;
  minPasswordLength: number;
};

/** Shape of Branch.Details (tenancy module). */
export type BranchDetails = {
  name?: string;
  code?: string;
  addressLine1?: string;
  addressLine2?: string;
  pin?: string;
  city?: string;
  district?: string;
  stateCode?: string;
};
export type BranchView = { id?: string; headOffice?: boolean; details?: BranchDetails };
export type Branches = { branches?: BranchView[]; suggestion?: BranchDetails | null };

export type ResponseOverrides = {
  "get /api/v1/onboarding/branches": Branches;
  "post /api/v1/onboarding/branches": BranchView;
  "put /api/v1/onboarding/branches/{id}": BranchView;
  "get /api/v1/auth/signup/options": SignupOptions;
  "put /api/v1/onboarding/business": S["BusinessProfile"];
  "get /api/v1/onboarding/company": S["Details"] | undefined;
  "put /api/v1/onboarding/company": S["Details"];
  "put /api/v1/onboarding/licences": S["Licences"];
  "get /api/v1/onboarding/books": S["Books"] | undefined;
  "put /api/v1/onboarding/books": S["Books"];
  "put /api/v1/onboarding/configuration": Record<string, string>;
  "post /api/v1/onboarding/go-live": S["Readiness"];
  "post /api/v1/onboarding/steps/{step}/skip": S["Checklist"];
  "get /api/v1/onboarding/branches/{id}": BranchView;
};
