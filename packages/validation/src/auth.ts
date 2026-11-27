/**
 * Auth form schemas, mirroring meno-api request records:
 * AuthController.LoginRequest, SignupController.SignupRequest, VerificationController.VerifyRequest (built) and
 * ForgotPassword / ResetPassword / AcceptInvitation / VerifyMobile (proposed: contracts/openapi/proposed/auth.yaml).
 * The password minimum is served by GET /api/v1/auth/signup/options (minPasswordLength), so it is a parameter here.
 */
import { z } from "zod";
import { businessName, email, INDIAN_MOBILE_PATTERN, indianMobile, optionValue, otpCode, personName } from "./fields";

export const PASSWORD_MAX = 128;

export function newPassword(minLength: number) {
  return z
    .string()
    .min(minLength, `Use at least ${minLength} characters.`)
    .max(PASSWORD_MAX, `Keep it under ${PASSWORD_MAX} characters.`)
    .refine((v) => v.trim().length === v.length, "Remove spaces at the start or end.");
}

/**
 * Sign in with email or Indian mobile (PLT-08). Mirrors LoginRequest: @NotBlank @Size(max=254) identifier; meno-api
 * normalises it the same way (AppUser.normalizeMobile). Sends a lower-cased email or the bare 10 digits.
 */
export const loginIdentifier = z
  .string()
  .trim()
  .min(1, "Enter your email or mobile number.")
  .max(254, "Keep it under 254 characters.")
  .transform((v, ctx) => {
    if (v.includes("@")) {
      const parsed = email.safeParse(v);
      if (parsed.success) return parsed.data;
      ctx.addIssue({ code: "custom", message: "Enter a valid email address." });
      return z.NEVER;
    }
    const digits = v.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, "");
    if (INDIAN_MOBILE_PATTERN.test(digits)) return digits;
    ctx.addIssue({ code: "custom", message: "Enter your email, or a 10-digit mobile number starting with 6, 7, 8 or 9." });
    return z.NEVER;
  });

/** Mirrors LoginRequest: identifier (email or mobile), @NotBlank @Size(max=128) password. */
export const loginRequest = z.object({
  identifier: loginIdentifier,
  password: z.string().min(1, "Enter your password.").max(PASSWORD_MAX, `Keep it under ${PASSWORD_MAX} characters.`),
});
export type LoginForm = z.input<typeof loginRequest>;
export type LoginRequest = z.infer<typeof loginRequest>;

/**
 * ONBOARDING.md step 1 / SignupRequest. `acceptTerms` is the checkbox; the request carries
 * acceptedTermsVersion (the version that was shown). `website` is the hidden bot trap and must stay empty.
 */
export function signupForm(minPasswordLength: number) {
  return z.object({
    ownerName: personName,
    mobile: indianMobile,
    email,
    password: newPassword(minPasswordLength),
    businessName,
    stateCode: optionValue("Choose your state."),
    partnerCode: z
      .string()
      .trim()
      .max(40, "Keep it under 40 characters.")
      .regex(/^[A-Za-z0-9-]*$/, "Use letters, digits and - only."),
    startWith: optionValue("Choose how you want to start."),
    acceptTerms: z.boolean().refine((v) => v, "Accept the terms and privacy notice to continue."),
    website: z.string().max(0),
  });
}
export type SignupForm = z.input<ReturnType<typeof signupForm>>;
export type SignupValues = z.infer<ReturnType<typeof signupForm>>;

export function toSignupRequest(v: SignupValues, termsVersion: string) {
  return {
    ownerName: v.ownerName,
    mobile: v.mobile,
    email: v.email,
    password: v.password,
    businessName: v.businessName,
    stateCode: v.stateCode,
    partnerCode: v.partnerCode || undefined,
    startWith: v.startWith,
    acceptedTermsVersion: termsVersion,
    website: v.website,
  };
}

export const verifyMobileRequest = z.object({ code: otpCode });
export type VerifyMobileRequest = z.infer<typeof verifyMobileRequest>;

export const forgotPasswordRequest = z.object({ email });
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequest>;

export function resetPasswordForm(minPasswordLength: number) {
  return z
    .object({ password: newPassword(minPasswordLength), confirmPassword: z.string() })
    .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "The passwords don't match." });
}
export type ResetPasswordForm = z.infer<ReturnType<typeof resetPasswordForm>>;

export function acceptInvitationForm(minPasswordLength: number) {
  return z
    .object({ fullName: personName, mobile: indianMobile, password: newPassword(minPasswordLength), confirmPassword: z.string() })
    .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "The passwords don't match." });
}
export type AcceptInvitationForm = z.infer<ReturnType<typeof acceptInvitationForm>>;

/** Rough strength hint shown under the password field; the API runs the real policy. */
export function passwordStrength(password: string, minLength: number): 0 | 1 | 2 | 3 {
  if (password.length < minLength) return 0;
  let kinds = 0;
  if (/[a-z]/.test(password)) kinds += 1;
  if (/[A-Z]/.test(password)) kinds += 1;
  if (/[0-9]/.test(password)) kinds += 1;
  if (/[^A-Za-z0-9]/.test(password)) kinds += 1;
  if (password.length >= minLength + 4 && kinds >= 3) return 3;
  if (kinds >= 2) return 2;
  return 1;
}
