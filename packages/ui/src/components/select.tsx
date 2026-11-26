"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "../cn";
import { useFieldControl } from "./field";
import { controlClass } from "./input";

export type SelectOption = { value: string; label: string; description?: string; disabled?: boolean };

type SelectProps = {
  value: string | undefined;
  onValueChange: (value: string) => void;
  /** Options always come from the API (no hard-coded lists, rule 13). */
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

/** Radix select styled with tokens (never a native <select>, DESIGN_LANGUAGE §4). */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  props,
  ref,
) {
  const { value, onValueChange, options, placeholder = "Select…", disabled, id, name, className, ...aria } = useFieldControl(props);
  return (
    <SelectPrimitive.Root value={value ?? ""} onValueChange={onValueChange} disabled={disabled} name={name}>
      <SelectPrimitive.Trigger
        ref={ref}
        id={id}
        {...aria}
        className={cn(
          controlClass,
          "flex h-9 items-center justify-between gap-2 px-3 text-left text-[14px] pointer-coarse:h-10 data-[placeholder]:text-ink-4",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-ink-3" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-[min(320px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-tile bg-raised shadow-pop"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="relative flex cursor-default items-center rounded-tab py-1.5 pr-8 pl-2.5 text-[13.5px] text-ink outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-hover"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2">
                  <Check className="size-3.5" aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});
