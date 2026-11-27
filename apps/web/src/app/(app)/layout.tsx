import { AppShell } from "@/components/layout/AppShell";
import { RequireSession } from "@/features/auth/components/RequireSession";

/** Signed-in workspace: session first, then the sidebar and top bar around every page in this group. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession>
      <AppShell>{children}</AppShell>
    </RequireSession>
  );
}
