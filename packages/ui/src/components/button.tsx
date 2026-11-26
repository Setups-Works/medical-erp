import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** `default` is the one primary action per view (DESIGN_LANGUAGE §4). */
  variant?: "default" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", size = "md", loading = false, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-ctl font-medium whitespace-nowrap select-none",
        "transition-[background-color,color,opacity,box-shadow] duration-[140ms] ease-meno",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-7 px-2.5 text-[12.5px]",
        size === "md" && "h-8 px-3 text-[13px] pointer-coarse:h-10",
        size === "lg" && "h-10 px-4 text-[14px]",
        size === "icon" && "size-8 rounded-tab pointer-coarse:size-10",
        variant === "default" && "bg-ink text-paper hover:opacity-90 active:opacity-85",
        variant === "outline" && "bg-raised text-ink shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-hover active:bg-press",
        variant === "ghost" && "text-ink-2 hover:bg-hover hover:text-ink active:bg-press",
        variant === "destructive" && "bg-critical text-paper hover:opacity-90",
        variant === "link" && "h-auto px-0 text-ink-2 underline-offset-4 hover:text-ink hover:underline",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
});
