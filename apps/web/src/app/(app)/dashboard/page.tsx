import type { Metadata } from "next";
import { DashboardScreen } from "@/features/dashboard/components/DashboardScreen";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardScreen />;
}
