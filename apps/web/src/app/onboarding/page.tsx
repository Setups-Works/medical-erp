import type { Metadata } from "next";
import { ChecklistScreen } from "@/features/onboarding/components/ChecklistScreen";

export const metadata: Metadata = { title: "Set-up" };

export default function Page() {
  return <ChecklistScreen />;
}
