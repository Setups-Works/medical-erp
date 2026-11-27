import { PlatformShell } from "@/features/platform/components/PlatformShell";
import { RequirePlatformSession } from "@/features/platform/components/RequirePlatformSession";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePlatformSession>
      <PlatformShell>{children}</PlatformShell>
    </RequirePlatformSession>
  );
}
