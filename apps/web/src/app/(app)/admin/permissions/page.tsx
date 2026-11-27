import type { Metadata } from "next";
import { PermissionsScreen } from "@/features/admin/components/PermissionsScreen";

export const metadata: Metadata = { title: "Permissions" };

export default function Page() {
  return <PermissionsScreen />;
}
