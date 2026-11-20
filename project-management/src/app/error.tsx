"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="grid min-h-[60dvh] place-items-center px-4">
      <div className="text-center">
        <h1 className="font-display text-[24px] font-semibold tracking-[-0.022em]">Something went wrong</h1>
        <p className="mt-1.5 text-[14px] text-ink-3">This page couldn’t load. Try again, or go back home.</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")}>Go home</Button>
        </div>
      </div>
    </main>
  );
}
