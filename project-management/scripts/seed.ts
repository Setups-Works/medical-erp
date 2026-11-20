/**
 * Re-imports the MENO plan into the hub database (safe to run many times).
 *   npm run seed        (reads .env.local / .env)
 */
import mongoose from "mongoose";
import { seedAll } from "../src/lib/seed-runner";

for (const f of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(f);
  } catch {
    /* file is optional */
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI in .env.local first (the in-memory dev DB seeds itself on startup).");
  await mongoose.connect(uri);
  await seedAll((s) => console.log(s));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
