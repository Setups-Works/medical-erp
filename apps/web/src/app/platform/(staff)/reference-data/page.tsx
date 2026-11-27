import type { Metadata } from "next";
import { ReferenceDataScreen } from "@/features/platform/components/ReferenceDataScreen";

export const metadata: Metadata = { title: "Reference data" };

export default function Page() {
  return <ReferenceDataScreen />;
}
