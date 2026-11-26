import type { Metadata } from "next";
import { LaterStep } from "@/features/onboarding/components/LaterStep";

export const metadata: Metadata = { title: "Plan" };

export default function Page() {
  return <LaterStep code="PLAN" />;
}
