"use client";

import { useQuery } from "@tanstack/react-query";
import { isApiError, type PincodeInfo } from "@meno/api-client";
import { api } from "@/lib/api";
import { keys } from "@/lib/query/keys";

/** VALIDATION_AND_BUSINESS_RULES.md: 6 digits, not starting with 0. Only complete PINs are looked up. */
export const isFullPin = (pin: string | undefined) => /^[1-9][0-9]{5}$/.test(pin ?? "");

/**
 * State, district and localities for a PIN (PLT-22): MENO's list first, India Post's directory for the rest (ADR-0021).
 * `null` when nobody knows the PIN (404): the form then lets the person type the details.
 */
export function usePincode(pin: string | undefined) {
  const value = (pin ?? "").trim();
  return useQuery({
    queryKey: keys.reference.pincode(value),
    enabled: isFullPin(value),
    staleTime: 24 * 60 * 60_000,
    queryFn: async (): Promise<PincodeInfo | null> => {
      try {
        return await api.get("/api/v1/reference/pincodes/{pincode}", { params: { pincode: value } });
      } catch (e) {
        if (isApiError(e) && e.status === 404) return null;
        throw e;
      }
    },
  });
}

/** City choices for a PIN: its post offices, then its district. Empty until the PIN is known. */
export function citySuggestions(info: PincodeInfo | null | undefined): string[] {
  return [...new Set([...(info?.localities ?? []), info?.district ?? ""].filter(Boolean))];
}
