"use client";

import { forwardRef, useRef } from "react";
import { cn } from "../cn";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  id?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** One box per digit; paste fills all boxes; works with SMS autofill (autocomplete=one-time-code). */
export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(function OtpInput(
  { value, onChange, length = 6, id, disabled, autoFocus, ...aria },
  ref,
) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setAt = (i: number, ch: string) => {
    const next = digits.slice();
    next[i] = ch;
    onChange(next.join("").slice(0, length));
  };

  return (
    <div ref={ref} id={id} role="group" aria-label="One-time code" className="flex gap-2" {...aria}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={aria["aria-invalid"]}
          maxLength={length}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (raw.length > 1) {
              // Paste or SMS autofill: spread the digits from this box onwards.
              const next = (digits.slice(0, i).join("") + raw).slice(0, length);
              onChange(next);
              inputs.current[Math.min(next.length, length - 1)]?.focus();
              return;
            }
            setAt(i, raw);
            if (raw && i < length - 1) inputs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
            if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < length - 1) inputs.current[i + 1]?.focus();
          }}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-11 w-10 rounded-ctl bg-raised text-center font-mono text-[18px] tabular-nums text-ink shadow-[inset_0_0_0_1px_var(--line-2)] outline-none",
            "focus:shadow-[inset_0_0_0_1.5px_var(--line-3)] aria-[invalid=true]:shadow-[inset_0_0_0_1px_var(--critical)] disabled:bg-sunken",
          )}
        />
      ))}
    </div>
  );
});
