import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __mongo?: Cache };
const cache: Cache = g.__mongo ?? (g.__mongo = { conn: null, promise: null });

async function open(): Promise<typeof mongoose> {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === "production") throw new Error("MONGODB_URI is required in production");
    // Development fallback: in-memory MongoDB inside this Node process. Data resets on restart.
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const server = await MongoMemoryServer.create();
    uri = server.getUri("meno_hub");
    console.warn("[hub] MONGODB_URI not set: using an in-memory MongoDB (data resets on restart).");
  }
  const conn = await mongoose.connect(uri, { bufferCommands: false });
  // First start on an empty database: create the team and import the MENO plan.
  const { autoSeedIfEmpty } = await import("./seed-runner");
  await autoSeedIfEmpty();
  return conn;
}

export async function connectDb() {
  if (cache.conn) return cache.conn;
  cache.promise ??= open().catch((e) => {
    cache.promise = null;
    throw e;
  });
  cache.conn = await cache.promise;
  return cache.conn;
}
