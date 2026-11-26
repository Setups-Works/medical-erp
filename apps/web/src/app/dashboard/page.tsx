import type { Metadata } from "next";
import { RequireSession } from "@/features/auth/components/RequireSession";
import { DashboardPlaceholder } from "@/features/auth/components/DashboardPlaceholder";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <RequireSession>
      <DashboardPlaceholder />
    </RequireSession>
  );
}
