import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Optional: cache fetch connections (recommended)
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
