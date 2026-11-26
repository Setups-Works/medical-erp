/**
 * Problem Details → what the person sees. meno-api `detail` texts are written for users (MenoException messages),
 * so they are shown as they are; raw codes never are (DESIGN_LANGUAGE §10). Spring's own validation errors have
 * no `code`, so they fall back to a generic sentence.
 */
import { isApiError, type ApiError } from "@meno/api-client";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

const FALLBACK: Record<string, string> = {
  NETWORK_ERROR: "Can't reach MENO. Check the internet connection and try again.",
  HTTP_400: "Some details need a fix. Check the highlighted fields.",
  HTTP_401: "Your session has ended. Please sign in again.",
  HTTP_403: "You don't have permission to do this.",
  HTTP_404: "This isn't available yet.",
  HTTP_429: "Too many attempts. Wait a minute and try again.",
  HTTP_500: "Something went wrong on our side. Try again in a moment.",
};

export function problemMessage(error: unknown, fallback = "Couldn't save. Try again."): string {
  if (!isApiError(error)) return fallback;
  if (error.code && !error.code.startsWith("HTTP_") && error.code !== "NETWORK_ERROR" && error.detail) return error.detail;
  return FALLBACK[error.code] ?? (error.status >= 500 ? FALLBACK.HTTP_500! : error.detail && error.status < 500 ? error.detail : fallback);
}

/**
 * Puts API errors next to their fields: `errors[]` from Problem Details, plus known codes that belong to one
 * field (e.g. TENANCY_GSTIN_STATE_MISMATCH → stateCode). Returns the message for the form-level callout when the
 * error isn't tied to a field.
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  codeToField: Partial<Record<string, Path<T>>> = {},
): string | null {
  if (!isApiError(error)) return problemMessage(error);
  const e: ApiError = error;
  let placed = false;
  for (const fe of e.fieldErrors) {
    setError(fe.field as Path<T>, { type: "server", message: fe.message ?? "Check this field." });
    placed = true;
  }
  const field = codeToField[e.code];
  if (field) {
    setError(field, { type: "server", message: problemMessage(e) });
    return null;
  }
  return placed ? "Some details need a fix. Check the highlighted fields." : problemMessage(e);
}
