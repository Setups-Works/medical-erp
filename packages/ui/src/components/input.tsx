import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../cn";

export const controlClass =
  "w-full rounded-ctl bg-raised text-ink placeholder:text-ink-4 shadow-[inset_0_0_0_1px_var(--line-2)] outline-none " +
  "transition-shadow duration-[140ms] focus:shadow-[inset_0_0_0_1px_var(--line-3)] " +
  "aria-[invalid=true]:shadow-[inset_0_0_0_1px_var(--critical)] disabled:bg-sunken disabled:text-ink-3 read-only:bg-sunken";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Text or icon shown inside the left edge (e.g. "+91"). */
  prefix?: React.ReactNode;
  /** Element inside the right edge (e.g. a Fetch button). */
  suffix?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, prefix, suffix, ...props }, ref) {
  if (!prefix && !suffix) {
    return <input ref={ref} className={cn(controlClass, "h-9 px-3 text-[14px] pointer-coarse:h-10", className)} {...props} />;
  }
  return (
    <div className="relative flex items-center">
      {prefix && <span className="pointer-events-none absolute left-3 text-[13.5px] text-ink-3">{prefix}</span>}
      <input
        ref={ref}
        className={cn(controlClass, "h-9 px-3 text-[14px] pointer-coarse:h-10", prefix ? "pl-11" : "", suffix ? "pr-24" : "", className)}
        {...props}
      />
      {suffix && <span className="absolute right-1 flex items-center">{suffix}</span>}
    </div>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "suffix">>(function PasswordInput(props, ref) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative flex items-center">
      <input
        ref={ref}
        type={shown ? "text" : "password"}
        {...props}
        className={cn(controlClass, "h-9 pr-10 pl-3 text-[14px] pointer-coarse:h-10", props.className)}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className="absolute right-1 grid size-7 place-items-center rounded-tab text-ink-3 hover:bg-hover hover:text-ink"
      >
        {shown ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(controlClass, "min-h-20 resize-y px-3 py-2 text-[14px] leading-relaxed", className)} {...props} />;
});

export const Checkbox = forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">>(function Checkbox(
  { className, ...props },
  ref,
) {
  return <input ref={ref} type="checkbox" className={cn("size-4 shrink-0 rounded-xs accent-[var(--ink)]", className)} {...props} />;
});
