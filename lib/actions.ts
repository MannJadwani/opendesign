"use server";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rid } from "@/lib/util/id";
import { and, desc, eq, inArray } from "drizzle-orm";

type SessionResult = Awaited<ReturnType<typeof auth.api.getSession>>;
const sessionMemo = (globalThis as unknown as {
  __sess?: Map<string, { v: SessionResult; t: number }>;
}).__sess ?? new Map<string, { v: SessionResult; t: number }>();
(globalThis as unknown as { __sess?: typeof sessionMemo }).__sess = sessionMemo;
const SESSION_TTL_MS = 30_000;

const getSessionCached = cache(async () => {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const key = cookie.match(/better-auth\.session_token=([^;]+)/)?.[1] ?? "";
  if (key) {
    const hit = sessionMemo.get(key);
    if (hit && Date.now() - hit.t < SESSION_TTL_MS) return hit.v;
  }
  const v = await auth.api.getSession({ headers: h });
  if (key) sessionMemo.set(key, { v, t: Date.now() });
  return v;
});

export async function invalidateSessionCache() {
  sessionMemo.clear();
}

export async function requireUser() {
  const session = await getSessionCached();
  if (!session) redirect("/login");
  return session.user;
}

export async function getSessionUser() {
  const session = await getSessionCached();
  return session?.user ?? null;
}

export async function listProjects() {
  const user = await requireUser();
  return db
    .select()
    .from(schema.project)
    .where(eq(schema.project.userId, user.id))
    .orderBy(desc(schema.project.updatedAt));
}

export async function listProjectsWithPreview() {
  const user = await requireUser();
  const projects = await db
    .select()
    .from(schema.project)
    .where(eq(schema.project.userId, user.id))
    .orderBy(desc(schema.project.updatedAt));
  if (projects.length === 0) return [];
  const ids = projects.map((p) => p.id);
  const arts = await db
    .select({
      projectId: schema.artifact.projectId,
      html: schema.artifact.html,
      version: schema.artifact.version,
    })
    .from(schema.artifact)
    .where(inArray(schema.artifact.projectId, ids));
  const latest = new Map<string, { html: string; version: number }>();
  for (const a of arts) {
    const prev = latest.get(a.projectId);
    if (!prev || a.version > prev.version) {
      latest.set(a.projectId, { html: a.html, version: a.version });
    }
  }
  return projects.map((p) => ({
    ...p,
    preview: latest.get(p.id)?.html ?? null,
  }));
}

export async function createProject(outputType: string = "website") {
  const user = await requireUser();
  const id = rid("prj");
  await db.insert(schema.project).values({
    id,
    userId: user.id,
    title: "Untitled",
    outputType,
  });
  redirect(`/p/${id}`);
}

export async function deleteProject(id: string) {
  const user = await requireUser();
  await db
    .delete(schema.project)
    .where(and(eq(schema.project.id, id), eq(schema.project.userId, user.id)));
  revalidatePath("/");
}

export async function getProject(id: string) {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(schema.project)
    .where(and(eq(schema.project.id, id), eq(schema.project.userId, user.id)))
    .limit(1);
  return row ?? null;
}
