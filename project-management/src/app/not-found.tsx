import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <p className="font-mono text-[13px] text-ink-4">404</p>
        <h1 className="mt-1 font-display text-[24px] font-semibold tracking-[-0.022em]">Page not found</h1>
        <p className="mt-1.5 text-[14px] text-ink-3">That board or page doesn’t exist.</p>
        <Link href="/" className="mt-5 inline-flex h-8 items-center rounded-ctl bg-ink px-3 text-[13px] font-medium text-paper">
          Go home
        </Link>
      </div>
    </main>
  );
}
