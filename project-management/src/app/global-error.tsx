"use client";

/** Last-resort error page (replaces the root layout, so it carries its own minimal styles). */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>MENO Hub hit an error</h1>
          <p style={{ opacity: 0.6 }}>Reload the page to continue.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "6px 14px", borderRadius: 8, border: "1px solid currentColor", background: "none", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
