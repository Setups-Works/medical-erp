"use client";

import { useEffect, useRef } from "react";
import type { PincodeInfo } from "@meno/api-client";
import { Icon } from "@meno/ui";
import { isFullPin, usePincode } from "../queries";

/**
 * What a PIN code tells an address form (PLT-22): a one-line answer under the address, and `onFound` once per PIN so
 * the form can fill fields that are still empty. City choices come from `citySuggestions` (a `<SuggestInput>`).
 * It never decides anything: a PIN in another state is pointed out, the person chooses.
 */
export function PinLookup({
  pin,
  stateCode,
  states,
  onFound,
}: {
  pin: string | undefined;
  stateCode: string | undefined;
  states: readonly { value: string; label: string }[];
  onFound: (info: PincodeInfo) => void;
}) {
  const lookup = usePincode(pin);
  const info = lookup.data;
  // A ref, so a new onFound each render doesn't refill fields the person has since changed.
  const found = useRef(onFound);
  found.current = onFound;
  const filledFor = useRef<string | null>(null);

  useEffect(() => {
    if (info?.pincode && filledFor.current !== info.pincode) {
      filledFor.current = info.pincode;
      found.current(info);
    }
  }, [info]);

  if (!isFullPin(pin)) return null;
  const stateName = (code: string | undefined) => states.find((s) => s.value === code)?.label ?? code ?? "";

  return (
    <div className="-mt-1 flex flex-col gap-1 text-[12.5px]" data-testid="pin-lookup">
      {lookup.isFetching && !info ? (
        <p className="flex items-center gap-1.5 text-ink-4" role="status">
          <Icon name="loader" className="size-3.5 animate-spin" />
          Looking up PIN {pin}…
        </p>
      ) : info ? (
        <p className="flex items-center gap-1.5 text-ink-3" role="status">
          <Icon name="check" className="size-3.5 text-success" />
          PIN {info.pincode}: {[info.district, stateName(info.stateCode)].filter(Boolean).join(", ")}
        </p>
      ) : info === null || lookup.isError ? (
        <p className="text-ink-4" role="status">
          {lookup.isError ? "Couldn’t look up this PIN right now." : "We don’t know this PIN."} Type the city and district.
        </p>
      ) : null}
      {info?.stateCode && stateCode && info.stateCode !== stateCode && (
        <p className="flex items-center gap-1.5 text-warning" role="alert">
          <Icon name="alert" className="size-3.5" />
          PIN {info.pincode} is in {stateName(info.stateCode)}, but the state chosen is {stateName(stateCode)}. Check both.
        </p>
      )}
    </div>
  );
}
