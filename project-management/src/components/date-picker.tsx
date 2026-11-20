"use client";

import * as Popover from "@radix-ui/react-popover";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./ui";

/** Small calendar popover (the design language avoids native date inputs). Value is yyyy-MM-dd or null. */
export function DatePicker({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const selected = value ? new Date(value) : null;
  const [month, setMonth] = useState(selected ?? new Date());
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  const today = new Date();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" className="justify-start font-normal">
          <CalendarDays className="size-3.5 text-ink-3" />
          {selected ? format(selected, "dd MMM yyyy") : <span className="text-ink-4">No due date</span>}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={6} className="z-50 w-[264px] rounded-tile bg-raised p-3 shadow-pop">
          <div className="mb-2 flex items-center justify-between">
            <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-[13.5px] font-medium">{format(month, "MMMM yyyy")}</span>
            <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} className="py-1 text-[11px] text-ink-4">
                {d}
              </span>
            ))}
            {days.map((d) => (
              <Popover.Close asChild key={d.toISOString()}>
                <button
                  onClick={() => onChange(format(d, "yyyy-MM-dd"))}
                  className={cn(
                    "h-8 rounded-tab text-[13px] tabular-nums hover:bg-hover",
                    !isSameMonth(d, month) && "text-ink-4",
                    isSameDay(d, today) && "font-semibold text-coral",
                    selected && isSameDay(d, selected) && "bg-ink text-paper hover:bg-ink",
                  )}
                >
                  {format(d, "d")}
                </button>
              </Popover.Close>
            ))}
          </div>
          {value && (
            <Popover.Close asChild>
              <Button variant="ghost" className="mt-2 w-full" onClick={() => onChange(null)}>
                Clear date
              </Button>
            </Popover.Close>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
