import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

const globalForPool = globalThis as unknown as { __pool?: Pool };

const pool =
  globalForPool.__pool ??
  new Pool({ connectionString: process.env.DATABASE_URL! });

if (!globalForPool.__pool) globalForPool.__pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
