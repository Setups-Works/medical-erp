import type { Metadata } from "next";
import { ConfigurationStep } from "@/features/onboarding/components/ConfigurationStep";

export const metadata: Metadata = { title: "Billing preferences" };

export default function Page() {
  return <ConfigurationStep />;
}
