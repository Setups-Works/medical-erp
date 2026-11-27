import type { NextConfig } from "next";

const isBuild = process.env.NODE_ENV === "production";
// Local dev only: proxy /api to meno-api so the refresh cookie is same-origin (in production Nginx does this).
const apiOrigin = process.env.MENO_API_ORIGIN ?? "http://localhost:8080";

const config: NextConfig = {
  // Static SPA (ADR-0003): no server, no API routes; the same build runs inside the Electron app.
  output: isBuild ? "export" : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["@meno/ui", "@meno/validation", "@meno/api-client"],
  ...(isBuild ? {} : { rewrites: async () => [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }] }),
};

export default config;
