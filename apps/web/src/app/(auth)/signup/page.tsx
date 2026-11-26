import type { Metadata } from "next";
import { SignupScreen } from "@/features/auth/components/SignupScreen";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return <SignupScreen />;
}
