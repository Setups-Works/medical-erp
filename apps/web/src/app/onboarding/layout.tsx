import { RequireSession } from "@/features/auth/components/RequireSession";
import { OnboardingShell } from "@/features/onboarding/components/OnboardingShell";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession>
      <OnboardingShell>{children}</OnboardingShell>
    </RequireSession>
  );
}
