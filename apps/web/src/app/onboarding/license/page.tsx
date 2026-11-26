import type { Metadata } from "next";
import { LaterStep } from "@/features/onboarding/components/LaterStep";

export const metadata: Metadata = { title: "License" };

export default function Page() {
  return <LaterStep code="LICENSE" title="License activation" description="Enter a license key you received." />;
}
