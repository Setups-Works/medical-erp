"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { Check, X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import type { Tint, UserT } from "@/lib/types";

/* ---------- Button ---------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "secondary", size = "sm", className, ...p },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-ctl font-medium whitespace-nowrap transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none select-none",
        size === "sm" && "h-8 px-3 text-[13px]",
        size === "md" && "h-10 px-4 text-[14px]",
        size === "icon" && "size-8 rounded-tab",
        variant === "primary" && "bg-ink text-paper hover:opacity-90",
        variant === "secondary" && "bg-raised text-ink shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover",
        variant === "ghost" && "text-ink-2 hover:bg-hover hover:text-ink",
        variant === "danger" && "bg-critical text-paper hover:opacity-90",
        className,
      )}
      {...p}
    />
  );
});

/* ---------- Inputs ---------- */
const field =
  "w-full rounded-ctl bg-raised text-ink placeholder:text-ink-4 shadow-[inset_0_0_0_1px_var(--line-2)] focus:shadow-[inset_0_0_0_1px_var(--line-3)] outline-none transition-shadow";
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(field, "h-9 px-3 text-[14px]", className)} {...p} />;
});
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...p },
  ref,
) {
  return <textarea ref={ref} className={cn(field, "px-3 py-2 text-[14px] leading-relaxed resize-y min-h-20", className)} {...p} />;
});
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("block text-[12.5px] font-medium text-ink-3 mb-1.5", className)}>{children}</span>;
}
export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-[13px] text-critical">
      {children}
    </p>
  );
}

/* ---------- Badge / tints ---------- */
export function Badge({ tint = "slate", children, className }: { tint?: Tint; children: React.ReactNode; className?: string }) {
  return <span className={cn(`at-${tint} tint inline-flex items-center gap-1 rounded-xs px-1.5 py-px text-[11.5px] font-medium`, className)}>{children}</span>;
}

const LABEL_TINTS: Tint[] = ["blue", "green", "amber", "violet", "pink", "red", "slate"];
export function labelTint(label: string): Tint {
  const known: Record<string, Tint> = {
    backend: "blue", frontend: "green", qa: "amber", devops: "red", lead: "violet", ba: "pink", "business-analysis": "pink",
    retail: "green", wholesale: "blue", both: "slate",
  };
  if (known[label]) return known[label];
  let h = 0;
  for (const c of label) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return LABEL_TINTS[h % LABEL_TINTS.length];
}

export const PRIORITY: Record<string, { label: string; tint: Tint }> = {
  high: { label: "High", tint: "red" },
  medium: { label: "Medium", tint: "amber" },
  low: { label: "Low", tint: "slate" },
};

/* ---------- Avatars ---------- */
export function Avatar({ user, size = 24, ring }: { user?: Pick<UserT, "name" | "tint">; size?: number; ring?: boolean }) {
  const initials = (user?.name ?? "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      title={user?.name}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
      className={cn(`at-${user?.tint ?? "slate"} tint inline-flex shrink-0 items-center justify-center rounded-full font-semibold`, ring && "ring-2 ring-paper")}
    >
      {initials}
    </span>
  );
}
export function AvatarStack({ users, size = 22, max = 4 }: { users: (UserT | undefined)[]; size?: number; max?: number }) {
  const list = users.filter(Boolean) as UserT[];
  return (
    <span className="flex -space-x-1.5">
      {list.slice(0, max).map((u) => (
        <Avatar key={u.id} user={u} size={size} ring />
      ))}
      {list.length > max && <span className="text-[11px] text-ink-3 pl-2.5">+{list.length - max}</span>}
    </span>
  );
}

/* ---------- Progress ---------- */
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full rounded-pill bg-sunken overflow-hidden", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-pill bg-ink transition-[width] duration-300" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-xs bg-sunken px-1.5 py-px font-mono text-[11px] text-ink-3">{children}</kbd>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-[13.5px] text-ink-3">{children}</p>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-ctl bg-sunken", className)} />;
}

/* ---------- Dialog ---------- */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/20 dark:bg-black/50" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-[6vh] z-50 -translate-x-1/2 w-[calc(100vw-32px)] max-h-[88vh] overflow-y-auto rounded-dlg bg-raised shadow-pop outline-none",
            wide ? "max-w-[920px]" : "max-w-[480px]",
          )}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-raised px-6 pt-5 pb-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-display text-[19px] font-semibold tracking-[-0.02em] text-ink">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-0.5 text-[13px] text-ink-3">{description}</DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">Dialog</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X className="size-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="px-6 pb-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ---------- Picker menu (single or multi select) ---------- */
export function Picker<T extends string>({
  trigger,
  options,
  value,
  onChange,
  multi,
  label,
}: {
  trigger: React.ReactNode;
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[];
  value: T[];
  onChange: (v: T[]) => void;
  multi?: boolean;
  label?: string;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="start" sideOffset={6} className="z-50 min-w-48 max-h-80 overflow-y-auto rounded-tile bg-raised p-1 shadow-pop">
          {label && <Menu.Label className="px-2 py-1.5 text-[11.5px] font-medium text-ink-4">{label}</Menu.Label>}
          {options.map((o) => {
            const on = value.includes(o.value);
            return (
              <Menu.Item
                key={o.value}
                onSelect={(e) => {
                  if (multi) {
                    e.preventDefault();
                    onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value]);
                  } else onChange([o.value]);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-tab px-2 py-1.5 text-[13.5px] text-ink outline-none data-[highlighted]:bg-hover"
              >
                {o.icon}
                <span className="flex-1">{o.label}</span>
                {on && <Check className="size-3.5 text-ink-2" />}
              </Menu.Item>
            );
          })}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

export { Menu };
