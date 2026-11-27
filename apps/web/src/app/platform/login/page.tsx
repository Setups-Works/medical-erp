import type { Metadata } from "next";
import { Suspense } from "react";
import { PlatformLoginScreen } from "@/features/platform/components/PlatformLoginScreen";

export const metadata: Metadata = { title: "Staff sign-in" };

export default function Page() {
  return (
    <Suspense>
      <PlatformLoginScreen />
    </Suspense>
  );
}
