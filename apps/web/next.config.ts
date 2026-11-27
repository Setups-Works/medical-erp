import type { NextConfig } from "next";

const isBuild = process.env.NODE_ENV === "production";
// Local dev only: proxy /api to meno-api so the refresh cookie is same-origin (in production Nginx does this).
const apiOrigin = process.env.MENO_API_ORIGIN ?? "http://localhost:8080";
// The Playwright server (mocks on) builds into its own folder. Sharing `.next` with `pnpm dev` (mocks off) let one
// server serve pages compiled with the other's NEXT_PUBLIC_API_MOCKING, since Next inlines NEXT_PUBLIC_* values.
const distDir = process.env.NEXT_DIST_DIR || ".next";

const config: NextConfig = {
  // Static SPA (ADR-0003): no server, no API routes; the same build runs inside the Electron app.
  output: isBuild ? "export" : undefined,
  distDir,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["@meno/ui", "@meno/validation", "@meno/api-client"],
  ...(isBuild ? {} : { rewrites: async () => [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }] }),
};

export default config;
