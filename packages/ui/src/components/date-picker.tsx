"use client";

import * as Popover from "@radix-ui/react-popover";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "../cn";
import { useFieldControl } from "./field";
import { controlClass } from "./input";

type DatePickerProps = {
  /** yyyy-MM-dd or empty */
  value: string | undefined;
  onChange: (value: string) => void;
  /** Inclusive bounds, yyyy-MM-dd */
  min?: string;
  max?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** Calendar popover (the design language forbids native date inputs). Shows dates as dd MMM yyyy. */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  props,
  ref,
) {
  const { value, onChange, min, max, placeholder = "Pick a date", id, disabled, ...aria } = useFieldControl(props);
  const selected = value ? parseISO(value) : null;
  const minD = min ? parseISO(min) : null;
  const maxD = max ? parseISO(max) : null;
  // Open on the chosen date, else today (moved inside min/max so the first view always has pickable days).
  const initialMonth = () => {
    if (selected) return selected;
    const today = new Date();
    if (minD && isBefore(today, minD)) return minD;
    if (maxD && isAfter(today, maxD)) return maxD;
    return today;
  };
  const [month, setMonth] = useState(initialMonth);
  const [open, setOpen] = useState(false);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const today = new Date();
  const outOfRange = (d: Date) => (minD && isBefore(d, minD) && !isSameDay(d, minD)) || (maxD && isAfter(d, maxD) && !isSameDay(d, maxD));

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setMonth(initialMonth());
      }}
    >
      <Popover.Trigger asChild>
        <button
          ref={ref}
          id={id}
          type="button"
          disabled={disabled}
          {...aria}
          className={cn(controlClass, "flex h-9 items-center gap-2 px-3 text-left text-[14px] pointer-coarse:h-10")}
        >
          <CalendarDays className="size-4 text-ink-3" aria-hidden />
          {selected ? <span className="tabular-nums">{format(selected, "dd MMM yyyy")}</span> : <span className="text-ink-4">{placeholder}</span>}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={6} className="z-50 w-[272px] rounded-tile bg-raised p-3 shadow-pop">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))} className="grid size-8 place-items-center rounded-tab hover:bg-hover">
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous year" onClick={() => setMonth(addMonths(month, -12))} className="rounded-tab px-1.5 text-[12px] text-ink-3 hover:bg-hover">
                «
              </button>
              <span className="text-[13.5px] font-medium" aria-live="polite">
                {format(month, "MMMM yyyy")}
              </span>
              <button type="button" aria-label="Next year" onClick={() => setMonth(addMonths(month, 12))} className="rounded-tab px-1.5 text-[12px] text-ink-3 hover:bg-hover">
                »
              </button>
            </div>
            <button type="button" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} className="grid size-8 place-items-center rounded-tab hover:bg-hover">
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center" role="grid">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1 text-[11px] text-ink-4">
                {d}
              </span>
            ))}
            {days.map((d) => {
              const off = outOfRange(d);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={Boolean(off)}
                  aria-label={format(d, "d MMMM yyyy")}
                  aria-pressed={selected ? isSameDay(d, selected) : false}
                  onClick={() => {
                    onChange(format(d, "yyyy-MM-dd"));
                    setOpen(false);
                  }}
                  className={cn(
                    "h-8 rounded-tab text-[13px] tabular-nums hover:bg-hover disabled:opacity-35 disabled:hover:bg-transparent",
                    !isSameMonth(d, month) && "text-ink-4",
                    isSameDay(d, today) && "font-semibold text-coral",
                    selected && isSameDay(d, selected) && "bg-ink text-paper hover:bg-ink",
                  )}
                >
                  {format(d, "d")}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
