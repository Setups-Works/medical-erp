import type { Metadata } from "next";
import { Suspense } from "react";
import { InviteScreen } from "@/features/auth/components/InviteScreen";

export const metadata: Metadata = { title: "Accept invitation" };

export default function Page() {
  return (
    <Suspense>
      <InviteScreen />
    </Suspense>
  );
}
