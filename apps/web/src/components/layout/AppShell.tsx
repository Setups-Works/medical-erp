"use client";

import { useGoToShortcuts } from "@/hooks/useGoToShortcuts";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/** Frame for every signed-in workspace page (apps/web AGENTS.md: `(app)/layout.tsx`). */
export function AppShell({ children }: { children: React.ReactNode }) {
  useGoToShortcuts();
  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main" className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-6 pb-12 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
