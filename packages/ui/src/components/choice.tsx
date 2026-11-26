"use client";

import { forwardRef, useRef } from "react";
import { cn } from "../cn";
import { useFieldControl, useFieldLabelId } from "./field";
import type { SelectOption } from "./select";

type ChoiceProps = {
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  id?: string;
  className?: string;
  columns?: 1 | 2 | 3;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  "aria-label"?: string;
};

/** Arrow keys move the selection inside a radio group (WAI-ARIA radio pattern). */
function useRovingKeys(options: readonly SelectOption[], value: string | undefined, onValueChange: (v: string) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    if (enabled.length === 0) return;
    const current = Math.max(0, enabled.indexOf(options.findIndex((o) => o.value === value)));
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = enabled[(current + step + enabled.length) % enabled.length]!;
    onValueChange(options[next]!.value);
    refs.current[next]?.focus();
  };
  return { refs, onKeyDown };
}

/** Large radio cards for a few choices with descriptions (business type, start with…). */
export const ChoiceCards = forwardRef<HTMLDivElement, ChoiceProps>(function ChoiceCards(
  props,
  ref,
) {
  const { value, onValueChange, options, id, className, columns = 2, ...aria } = useFieldControl(props);
  const { refs, onKeyDown } = useRovingKeys(options, value, onValueChange);
  const labelledBy = useFieldLabelId();
  const selectedIndex = options.findIndex((o) => o.value === value);
  return (
    <div
      ref={ref}
      id={id}
      role="radiogroup"
      aria-labelledby={aria["aria-label"] ? undefined : labelledBy}
      {...aria}
      onKeyDown={onKeyDown}
      className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3", className)}
    >
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            tabIndex={on || (selectedIndex < 0 && i === 0) ? 0 : -1}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "flex min-h-11 flex-col items-start gap-0.5 rounded-tile bg-raised px-3 py-2.5 text-left shadow-[inset_0_0_0_1px_var(--line-2)]",
              "transition-shadow duration-[140ms] hover:bg-hover disabled:opacity-50",
              on && "bg-accent-wash shadow-[inset_0_0_0_1.5px_var(--ink)] hover:bg-accent-wash",
            )}
          >
            <span className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
              <span
                aria-hidden
                className={cn("grid size-3.5 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line-3)]", on && "shadow-[inset_0_0_0_4px_var(--ink)]")}
              />
              {o.label}
            </span>
            {o.description && <span className="pl-5.5 text-[12.5px] text-ink-3">{o.description}</span>}
          </button>
        );
      })}
    </div>
  );
});

/** Compact segmented control: grey track, raised active segment. */
export const Segmented = forwardRef<HTMLDivElement, ChoiceProps>(function Segmented(
  props,
  ref,
) {
  const { value, onValueChange, options, id, className, ...aria } = useFieldControl(props);
  const { refs, onKeyDown } = useRovingKeys(options, value, onValueChange);
  const labelledBy = useFieldLabelId();
  const selectedIndex = options.findIndex((o) => o.value === value);
  return (
    <div
      ref={ref}
      id={id}
      role="radiogroup"
      aria-labelledby={aria["aria-label"] ? undefined : labelledBy}
      {...aria}
      onKeyDown={onKeyDown}
      className={cn("inline-flex max-w-full flex-wrap gap-0.5 rounded-ctl bg-sunken p-[3px]", className)}
    >
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            tabIndex={on || (selectedIndex < 0 && i === 0) ? 0 : -1}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "h-7 rounded-tab px-3 text-[12.5px] text-ink-3 transition-colors duration-[140ms] hover:text-ink disabled:opacity-50 pointer-coarse:h-9",
              on && "bg-raised font-medium text-ink shadow-[0_0_0_1px_var(--line)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
});
