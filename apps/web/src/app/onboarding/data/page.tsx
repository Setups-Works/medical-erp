import type { Metadata } from "next";
import { LaterStep } from "@/features/onboarding/components/LaterStep";

export const metadata: Metadata = { title: "Data" };

export default function Page() {
  return <LaterStep code="DATA" />;
}
