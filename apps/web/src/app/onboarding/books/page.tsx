import type { Metadata } from "next";
import { BooksStep } from "@/features/onboarding/components/BooksStep";

export const metadata: Metadata = { title: "Books" };

export default function Page() {
  return <BooksStep />;
}
