import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyScreen } from "@/features/auth/components/VerifyScreen";

export const metadata: Metadata = { title: "Verify account" };

export default function Page() {
  return (
    <Suspense>
      <VerifyScreen />
    </Suspense>
  );
}
