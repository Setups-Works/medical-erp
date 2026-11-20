"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Large, accessible checkbox used by the Features and Pages checklists. */
export function CheckBox({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-xs transition-colors duration-150 disabled:opacity-50",
        checked ? "bg-success text-paper" : "bg-raised shadow-[inset_0_0_0_1.5px_var(--line-3)] hover:bg-hover",
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  );
}
