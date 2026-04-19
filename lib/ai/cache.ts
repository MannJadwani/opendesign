import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export function cacheKey(tool: string, args: unknown): string {
  const h = createHash("sha256");
  h.update(tool);
  h.update("\0");
  h.update(JSON.stringify(args ?? null));
  return `${tool}:${h.digest("hex").slice(0, 24)}`;
}

export async function getCached<T>(
  key: string,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T | null> {
  const [row] = await db
    .select()
    .from(schema.toolCache)
    .where(eq(schema.toolCache.key, key))
    .limit(1);
  if (!row) return null;
  const ageMs = Date.now() - new Date(row.createdAt).getTime();
  if (ageMs > ttlMs) return null;
  return row.value as T;
}

export async function setCached(key: string, value: unknown): Promise<void> {
  await db
    .insert(schema.toolCache)
    .values({ key, value: value as object })
    .onConflictDoUpdate({
      target: schema.toolCache.key,
      set: { value: value as object, createdAt: new Date() },
    });
}
