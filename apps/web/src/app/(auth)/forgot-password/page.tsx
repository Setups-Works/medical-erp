import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/features/auth/components/ForgotPasswordScreen";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return <ForgotPasswordScreen />;
}
