import type { Metadata } from "next";
import { CompanyStep } from "@/features/onboarding/components/CompanyStep";

export const metadata: Metadata = { title: "Company & GST" };

export default function Page() {
  return <CompanyStep />;
}
