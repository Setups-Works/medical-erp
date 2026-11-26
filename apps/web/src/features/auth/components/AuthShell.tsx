"use client";

import Link from "next/link";
import { Button, Icon, Wordmark, cn } from "@meno/ui";
import { useTheme } from "@/hooks/useTheme";

/** Public pages: centred column, wordmark, theme switch. Works at 375 px (owners often sign up on a phone). */
export function AuthShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const { scheme, toggle } = useTheme();
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/login/" className="rounded-tab" aria-label="MENO home">
          <Wordmark size={26} />
        </Link>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={scheme === "dark" ? "Switch to light" : "Switch to dark"}>
          <Icon name={scheme === "dark" ? "sun" : "moon"} />
        </Button>
      </header>
      <main className={cn("mx-auto w-full flex-1 px-4 pt-6 pb-12 sm:pt-12", wide ? "max-w-[640px]" : "max-w-[420px]")}>{children}</main>
      <footer className="px-4 pb-6 text-center text-[12px] text-ink-4">MENO by Setups Works · Pharmacy Management, Simplified.</footer>
    </div>
  );
}

export function AuthHeading({ title, description }: { title: string; description?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-[clamp(24px,3vw,28px)] leading-[1.15] font-semibold tracking-[-0.022em] text-ink">{title}</h1>
      {description && <p className="mt-2 text-[14px] text-ink-3">{description}</p>}
    </div>
  );
}
