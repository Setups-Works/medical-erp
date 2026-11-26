import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "../cn";

export type Tint = "blue" | "green" | "amber" | "red" | "violet" | "pink" | "slate";

/** Flat card: raised surface, hairline inset ring, 12 px corners, no shadow. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card bg-raised p-5 shadow-[inset_0_0_0_1px_var(--line)] sm:p-[22px]", className)} {...props} />;
}

export function Badge({ tint = "slate", className, children }: { tint?: Tint; className?: string; children: React.ReactNode }) {
  return <span className={cn(`at-${tint} tint inline-flex items-center gap-1 rounded-xs px-1.5 py-px text-[11.5px] font-medium`, className)}>{children}</span>;
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-xs px-1 font-mono text-[11px] text-ink-3 shadow-[inset_0_0_0_1px_var(--line-2)]", className)}>
      {children}
    </kbd>
  );
}

const CALLOUT = {
  info: { Icon: Info, tone: "text-data" },
  success: { Icon: CheckCircle2, tone: "text-success" },
  warning: { Icon: AlertTriangle, tone: "text-warning" },
  critical: { Icon: XCircle, tone: "text-critical" },
} as const;

/** Inline message. Colour is never the only signal: there is always an icon and text. */
export function Callout({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof CALLOUT;
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { Icon, tone: color } = CALLOUT[tone];
  return (
    <div
      role={tone === "critical" ? "alert" : "status"}
      className={cn("flex gap-2.5 rounded-tile bg-side px-3 py-2.5 text-[13px] shadow-[inset_0_0_0_1px_var(--line)]", className)}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", color)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children && <div className="text-ink-2">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-ctl bg-sunken", className)} />;
}

/** MENO wordmark. Instrument Serif is used only here (DESIGN_LANGUAGE §1). */
export function Wordmark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span className={cn("font-brand leading-none tracking-[-0.01em] text-ink", className)} style={{ fontSize: size }}>
      MENO
    </span>
  );
}

/** Thin progress bar with an accessible value. */
export function Progress({ value, max = 100, label, className }: { value: number; max?: number; label: string; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className={cn("h-1.5 overflow-hidden rounded-pill bg-sunken", className)}>
      <div className="h-full rounded-pill bg-ink transition-[width] duration-200 ease-meno-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("mb-[18px] flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-[12.5px] text-ink-4">{eyebrow}</p>}
        <h1 className="font-display text-[clamp(26px,3vw,32px)] leading-[1.1] font-semibold tracking-[-0.022em] text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-[62ch] text-[14px] text-ink-3">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({ title, action, className }: { title: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-10 text-center text-[13.5px] text-ink-3", className)}>
      <p>{title}</p>
      {action}
    </div>
  );
}
