"use client";

import * as P from "@radix-ui/react-popover";
import { forwardRef } from "react";
import { cn } from "../cn";

export const Popover = P.Root;
export const PopoverTrigger = P.Trigger;
export const PopoverClose = P.Close;

/** Floating layer (DESIGN_LANGUAGE §3): raised surface, hairline ring, `shadow-pop`, 12 px corners. Esc closes it. */
export const PopoverContent = forwardRef<HTMLDivElement, P.PopoverContentProps>(({ className, sideOffset = 6, align = "end", ...props }, ref) => (
  <P.Portal>
    <P.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn("z-50 min-w-[220px] rounded-card bg-raised p-1.5 text-[13.5px] text-ink shadow-pop outline-none", className)}
      {...props}
    />
  </P.Portal>
));
PopoverContent.displayName = "PopoverContent";
