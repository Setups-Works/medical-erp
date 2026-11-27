"use client";

import { forwardRef, useId, useState } from "react";
import { cn } from "../cn";
import { useFieldControl } from "./field";
import { controlClass } from "./input";

export type SuggestInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "list"> & {
  value: string;
  onChange: (value: string) => void;
  /** Choices shown under the box (e.g. post offices of a PIN). Typing anything else is still allowed. */
  suggestions: readonly string[];
};

/**
 * Text box with a dropdown of suggestions (ARIA 1.2 combobox, list autocomplete). For values that are usually one
 * of a few known answers but may be something else: a city from the PIN's post offices. ↑/↓ move, Enter picks, Esc
 * closes; the list filters as you type. Use `<Select>` when only listed values are allowed.
 */
export const SuggestInput = forwardRef<HTMLInputElement, SuggestInputProps>(function SuggestInput(
  { value, onChange, suggestions, className, onBlur, onKeyDown, onFocus, ...rest },
  ref,
) {
  // Label, hint and error wiring from the enclosing <Field>; explicit props win.
  const field = useFieldControl<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string; "aria-required"?: boolean }>({});
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const text = value.trim().toLowerCase();
  const unique = [...new Set(suggestions.filter(Boolean))];
  // Show everything while the box is empty or already holds a listed value; otherwise filter by what is typed.
  const shown = !text || unique.some((s) => s.toLowerCase() === text) ? unique : unique.filter((s) => s.toLowerCase().includes(text));
  const expanded = open && shown.length > 0;

  const pick = (s: string) => {
    onChange(s);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        className={cn(controlClass, "h-9 px-3 text-[14px] pointer-coarse:h-10", className)}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={(e) => {
          setOpen(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setOpen(false);
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!expanded) {
              setOpen(true);
              return;
            }
            const step = e.key === "ArrowDown" ? 1 : -1;
            setActive((i) => (i + step + shown.length) % shown.length);
          } else if (e.key === "Enter" && expanded && active >= 0) {
            const choice = shown[active];
            if (choice === undefined) return;
            e.preventDefault();
            pick(choice);
          } else if (e.key === "Escape" && expanded) {
            e.preventDefault();
            setOpen(false);
          }
        }}
        {...rest}
        id={rest.id ?? field.id}
        aria-invalid={rest["aria-invalid"] ?? field["aria-invalid"]}
        aria-describedby={rest["aria-describedby"] ?? field["aria-describedby"]}
        aria-required={rest["aria-required"] ?? field["aria-required"]}
      />
      <ul
        id={listId}
        role="listbox"
        hidden={!expanded}
        className="absolute top-full right-0 left-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-tile bg-raised p-1 shadow-pop"
      >
        {shown.map((s, i) => (
          <li
            key={s}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            // mousedown, not click: picking must happen before the input's blur closes the list.
            onMouseDown={(e) => {
              e.preventDefault();
              pick(s);
            }}
            className={cn("cursor-default truncate rounded-tab px-2.5 py-1.5 text-[13.5px] text-ink-2 hover:bg-hover", i === active && "bg-hover text-ink")}
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
});
