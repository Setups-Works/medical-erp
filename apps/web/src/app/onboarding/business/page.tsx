import type { Metadata } from "next";
import { BusinessStep } from "@/features/onboarding/components/BusinessStep";

export const metadata: Metadata = { title: "Business profile" };

export default function Page() {
  return <BusinessStep />;
}
