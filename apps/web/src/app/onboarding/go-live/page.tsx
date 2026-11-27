import type { Metadata } from "next";
import { GoLiveStep } from "@/features/onboarding/components/GoLiveStep";

export const metadata: Metadata = { title: "Go live" };

export default function Page() {
  return <GoLiveStep />;
}
