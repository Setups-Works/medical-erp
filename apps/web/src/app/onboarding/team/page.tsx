import type { Metadata } from "next";
import { TeamStep } from "@/features/onboarding/components/TeamStep";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <TeamStep />;
}
