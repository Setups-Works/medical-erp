import type { Metadata } from "next";
import { BranchesStep } from "@/features/onboarding/components/BranchesStep";

export const metadata: Metadata = { title: "Branches" };

export default function Page() {
  return <BranchesStep />;
}
