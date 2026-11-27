export { ApiError, createApiClient, isApiError, type ApiClient, type ApiClientConfig, type Body, type FieldError, type Paths, type Response, type TokenResponse } from "./client";
export type { BranchDetails, Branches, BranchView, SignupOptions } from "./overrides";
import type { components as Built } from "./generated/meno-api";
import type { components as Proposed } from "./generated/proposed";

/** Schema aliases so features never hand-write request or response types (AGENTS.md rule 9). */
type S = Built["schemas"];
export type MeResponse = S["MeResponse"];
export type UserView = S["UserView"];
export type SignupRequest = S["SignupRequest"];
export type VerificationStatus = S["Status"];
export type Option = S["Option"];
export type OnboardingOptions = S["Options"];
export type SettingInfo = S["SettingInfo"];
export type Checklist = S["Checklist"];
export type StepStatus = S["StepStatus"];
export type BusinessProfile = S["BusinessProfile"];
export type BusinessRequest = S["BusinessRequest"];
export type CompanyDetails = S["Details"];
export type CompanyRequest = S["CompanyRequest"];
export type Licences = S["Licences"];
export type LicencesRequest = S["LicencesRequest"];
export type BranchRequest = S["BranchRequest"];
export type Books = S["Books"];
export type BooksRequest = S["BooksRequest"];
export type Readiness = S["Readiness"];
export type ReadinessCheck = S["Check"];
export type GstinView = S["GstinView"];
export type ResetPasswordRequest = S["ResetPasswordRequest"];
export type TeamOptions = S["TeamOptions"];
export type TeamRoleOption = S["RoleOption"];
export type TeamBranchOption = S["BranchOption"];
export type TeamInvitation = S["TeamInvitation"];
export type TeamInvitationPage = S["TeamInvitationPage"];
export type TeamInvitationRequest = S["TeamInvitationRequest"];

// Proposed (contracts/openapi/proposed/auth.yaml), served by MSW until built.
type P = Proposed["schemas"];
export type InvitationView = P["InvitationView"];
export type AcceptInvitationRequest = P["AcceptInvitationRequest"];
