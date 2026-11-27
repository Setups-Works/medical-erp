import { passwordStrength } from "@meno/validation";
import { cn } from "@meno/ui";

const LABELS = ["Too short", "Weak", "Good", "Strong"] as const;

/** Strength hint under a new-password field. Text plus bars, so colour is never the only signal. */
export function PasswordMeter({ password, minLength }: { password: string; minLength: number }) {
  if (!password) return null;
  const s = passwordStrength(password, minLength);
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-pill bg-sunken", s >= i && (s === 1 ? "bg-warning" : s === 2 ? "bg-ink-3" : "bg-success"))} />
        ))}
      </div>
      <span className="text-[12px] text-ink-3">{LABELS[s]}</span>
    </div>
  );
}
