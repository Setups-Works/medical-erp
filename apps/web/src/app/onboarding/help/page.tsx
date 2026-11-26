import type { Metadata } from "next";
import { LaterStep } from "@/features/onboarding/components/LaterStep";

export const metadata: Metadata = { title: "Help" };

export default function Page() {
  return <LaterStep code="HELP" title="Set-up help" description="Book a call or give our team time-boxed access." />;
}
