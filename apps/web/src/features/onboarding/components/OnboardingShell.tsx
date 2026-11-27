"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge, Button, Callout, Icon, Progress, Skeleton, Wordmark, cn } from "@meno/ui";
import { useTheme } from "@/hooks/useTheme";
import { useSessionUser } from "@/lib/session";
import { useLogout, useVerificationStatus } from "@/features/auth/queries";
import { useChecklist } from "../queries";
import { progress, stepCopy, stepState, withSlash } from "../utils";

/** Frame for every /onboarding page: step list (desktop), progress bar (phone), account menu. */
export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const checklist = useChecklist();
  const pathname = withSlash(usePathname());
  const { done, total } = progress(checklist.data);
  const verification = useVerificationStatus();
  const emailPending = verification.data && !verification.data.emailVerified;

  return (
    <div className="flex min-h-dvh flex-col bg-paper lg:flex-row">
      <aside className="hidden w-[264px] shrink-0 flex-col border-r border-line bg-side lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div className="flex h-14 items-center px-5">
          <Wordmark size={24} />
          <span className="ml-2 text-[11px] text-ink-4">Set-up</span>
        </div>
        <nav aria-label="Set-up steps" className="flex-1 overflow-y-auto px-3 pb-4">
          <Link
            href="/onboarding/"
            aria-current={pathname === "/onboarding/" ? "page" : undefined}
            className={cn("mb-2 flex h-8 items-center gap-2.5 rounded-tab px-2 text-[13.5px] text-ink-2 hover:bg-hover hover:text-ink", pathname === "/onboarding/" && "bg-raised font-medium text-ink shadow-[0_0_0_1px_var(--line)]")}
          >
            <Icon name="check-circle" className="text-ink-4" />
            Checklist
            <span className="ml-auto font-mono text-[11.5px] text-ink-4 tabular-nums">
              {done}/{total}
            </span>
          </Link>
          {checklist.isPending && <Skeleton className="h-60" />}
          <ol className="flex flex-col gap-0.5">
            {checklist.data?.steps?.map((s) => {
              const href = withSlash(s.route ?? "/onboarding");
              const active = pathname === href;
              const state = stepState(s);
              const copy = stepCopy(s.code);
              return (
                <li key={s.code}>
                  <Link
                    href={href}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-tab px-2 text-[13px] text-ink-3 hover:bg-hover hover:text-ink",
                      active && "bg-raised font-medium text-ink shadow-[0_0_0_1px_var(--line)]",
                      state === "later" && "text-ink-4",
                    )}
                  >
                    <StepIcon state={state} />
                    <span className="truncate">{copy.title}</span>
                    {state === "later" && <span className="ml-auto font-mono text-[11px] text-ink-4">{s.phase}</span>}
                    {s.required && state === "todo" && <span className="sr-only">(required)</span>}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/onboarding/go-live/"
                aria-current={pathname === "/onboarding/go-live/" ? "step" : undefined}
                className={cn("mt-1 flex h-8 items-center gap-2.5 rounded-tab px-2 text-[13px] text-ink-3 hover:bg-hover hover:text-ink", pathname === "/onboarding/go-live/" && "bg-raised font-medium text-ink shadow-[0_0_0_1px_var(--line)]")}
              >
                <Icon name="rocket" className={checklist.data?.live ? "text-success" : "text-ink-4"} />
                Go live
              </Link>
            </li>
          </ol>
          <Link href="/onboarding/help/" className="mt-4 flex h-8 items-center gap-2.5 rounded-tab px-2 text-[13px] text-ink-3 hover:bg-hover hover:text-ink">
            <Icon name="help" className="text-ink-4" />
            Set-up help
          </Link>
        </nav>
        <AccountFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-line bg-paper px-4 lg:hidden">
          <Link href="/onboarding/" aria-label="Set-up checklist">
            <Wordmark size={22} />
          </Link>
          <Progress value={done} max={Math.max(total, 1)} label="Set-up progress" className="flex-1" />
          <span className="font-mono text-[12px] text-ink-3 tabular-nums">
            {done}/{total}
          </span>
          <MobileMenu />
        </header>
        <main className="mx-auto w-full max-w-[760px] px-4 py-6 sm:px-8 sm:py-10">
          {emailPending && (
            <Callout tone="warning" className="mb-6" action={<Link href="/verify/" className="text-[13px] font-medium text-ink underline-offset-4 hover:underline">Verify</Link>}>
              Confirm your email before you go live.
            </Callout>
          )}
          {checklist.data?.live && pathname !== "/onboarding/go-live/" && (
            <Callout tone="success" className="mb-6" action={<Link href="/dashboard/" className="text-[13px] font-medium text-ink underline-offset-4 hover:underline">Open MENO</Link>}>
              Set-up is finished. Change these details in Settings.
            </Callout>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

function StepIcon({ state }: { state: ReturnType<typeof stepState> }) {
  if (state === "done") return <Icon name="check-circle" className="text-success" label="Done" />;
  if (state === "skipped") return <Icon name="circle-dashed" className="text-ink-4" label="Skipped" />;
  if (state === "later") return <Icon name="circle-dashed" className="text-ink-4" label="Coming later" />;
  return <Icon name="circle" className="text-ink-4" label="To do" />;
}

function AccountFooter() {
  const user = useSessionUser();
  const { scheme, toggle } = useTheme();
  const logout = useLogout();
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 border-t border-line p-3">
      <div className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-[11px] font-medium text-ink-2" aria-hidden>
        {(user?.fullName ?? "?").slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-ink">{user?.fullName}</p>
        <p className="truncate text-[11.5px] text-ink-4">{user?.email}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={toggle} aria-label={scheme === "dark" ? "Switch to light" : "Switch to dark"}>
        <Icon name={scheme === "dark" ? "sun" : "moon"} />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => logout.mutate(undefined, { onSettled: () => router.replace("/login/") })}>
        <Icon name="log-out" />
      </Button>
    </div>
  );
}

function MobileMenu() {
  const logout = useLogout();
  const router = useRouter();
  const { scheme, toggle } = useTheme();
  return (
    <div className="flex items-center">
      <Button variant="ghost" size="icon" onClick={toggle} aria-label={scheme === "dark" ? "Switch to light" : "Switch to dark"}>
        <Icon name={scheme === "dark" ? "sun" : "moon"} />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => logout.mutate(undefined, { onSettled: () => router.replace("/login/") })}>
        <Icon name="log-out" />
      </Button>
    </div>
  );
}

export function LaterBadge({ phase }: { phase?: string }) {
  return <Badge tint="slate">{phase ? `Coming in ${phase}` : "Coming later"}</Badge>;
}
