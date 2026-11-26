import type { Metadata } from "next";
import { LicencesStep } from "@/features/onboarding/components/LicencesStep";

export const metadata: Metadata = { title: "Licences" };

export default function Page() {
  return <LicencesStep />;
}
