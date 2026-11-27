import type { Metadata } from "next";
import { RolesScreen } from "@/features/admin/components/RolesScreen";

export const metadata: Metadata = { title: "Roles" };

export default function Page() {
  return <RolesScreen />;
}
