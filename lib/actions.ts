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

export async function createProject(
  input:
    | string
    | {
        name?: string;
        outputType?: string;
        designSystemId?: string | null;
        fidelity?: "wireframe" | "high";
      } = {},
) {
  const user = await requireUser();
  const opts = typeof input === "string" ? { outputType: input } : input;
  const id = rid("prj");
  await db.insert(schema.project).values({
    id,
    userId: user.id,
    title: opts.name?.trim() || "Untitled",
    outputType: opts.outputType ?? "website",
    fidelity: opts.fidelity ?? "high",
    designSystemId: opts.designSystemId ?? null,
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

async function assertProjectOwner(projectId: string, userId: string) {
  const [row] = await db
    .select({ id: schema.project.id })
    .from(schema.project)
    .where(and(eq(schema.project.id, projectId), eq(schema.project.userId, userId)))
    .limit(1);
  if (!row) throw new Error("not_found");
}

export type CommentRow = {
  id: string;
  artifactId: string;
  authorName: string | null;
  anchor: string | null;
  leafId: string | null;
  xPct: number | null;
  yPct: number | null;
  body: string;
  resolved: boolean;
  createdAt: Date;
};

export async function listCommentsForArtifact(
  projectId: string,
  artifactId: string,
): Promise<CommentRow[]> {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const rows = await db
    .select()
    .from(schema.comment)
    .where(eq(schema.comment.artifactId, artifactId))
    .orderBy(desc(schema.comment.createdAt));
  return rows as CommentRow[];
}

export async function createComment(
  projectId: string,
  artifactId: string,
  input: {
    body: string;
    xPct: number | null;
    yPct: number | null;
    leafId: string | null;
    anchor: string | null;
  },
): Promise<CommentRow> {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const id = rid("cmt");
  const [row] = await db
    .insert(schema.comment)
    .values({
      id,
      artifactId,
      authorId: user.id,
      authorName: user.name ?? user.email ?? null,
      body: input.body,
      xPct: input.xPct,
      yPct: input.yPct,
      leafId: input.leafId,
      anchor: input.anchor,
    })
    .returning();
  return row as CommentRow;
}

export async function resolveComment(projectId: string, commentId: string, resolved: boolean) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  await db
    .update(schema.comment)
    .set({ resolved })
    .where(eq(schema.comment.id, commentId));
}

export async function deleteComment(projectId: string, commentId: string) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  await db.delete(schema.comment).where(eq(schema.comment.id, commentId));
}

export async function saveEditedArtifact(
  projectId: string,
  html: string,
  title?: string,
  controls?: unknown,
) {
  const user = await requireUser();
  const [project] = await db
    .select()
    .from(schema.project)
    .where(
      and(
        eq(schema.project.id, projectId),
        eq(schema.project.userId, user.id),
      ),
    )
    .limit(1);
  if (!project) throw new Error("not_found");
  const [latest] = await db
    .select({ version: schema.artifact.version })
    .from(schema.artifact)
    .where(eq(schema.artifact.projectId, projectId))
    .orderBy(desc(schema.artifact.version))
    .limit(1);
  const version = (latest?.version ?? 0) + 1;
  const id = rid("art");
  await db.insert(schema.artifact).values({
    id,
    projectId,
    version,
    variant: 0,
    html,
    sidecar: {
      title: title ?? project.title,
      edited: true,
      controls: Array.isArray(controls) ? controls : [],
    },
  });
  await db
    .update(schema.project)
    .set({ updatedAt: new Date() })
    .where(eq(schema.project.id, projectId));
  return { id, version };
}

export type DesignSystemRow = {
  id: string;
  name: string;
  tokens: import("@/lib/ai/scrapers/brand-ingest").BrandTokens;
  createdAt: Date;
  updatedAt: Date;
};

export async function listDesignSystems(): Promise<DesignSystemRow[]> {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(schema.designSystem)
    .where(eq(schema.designSystem.userId, user.id))
    .orderBy(desc(schema.designSystem.updatedAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    tokens: r.tokens as DesignSystemRow["tokens"],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function getDesignSystem(
  id: string,
): Promise<DesignSystemRow | null> {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(schema.designSystem)
    .where(
      and(
        eq(schema.designSystem.id, id),
        eq(schema.designSystem.userId, user.id),
      ),
    )
    .limit(1);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    tokens: row.tokens as DesignSystemRow["tokens"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createDesignSystemAction(input: {
  name: string;
  tokens: import("@/lib/ai/scrapers/brand-ingest").BrandTokens;
}): Promise<{ id: string }> {
  const user = await requireUser();
  const id = rid("ds");
  await db.insert(schema.designSystem).values({
    id,
    userId: user.id,
    name: input.name.trim() || "Untitled system",
    tokens: input.tokens,
  });
  revalidatePath("/systems");
  return { id };
}

export async function updateDesignSystemAction(
  id: string,
  patch: {
    name?: string;
    tokens?: import("@/lib/ai/scrapers/brand-ingest").BrandTokens;
  },
): Promise<void> {
  const user = await requireUser();
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.name !== undefined) update.name = patch.name.trim() || "Untitled system";
  if (patch.tokens !== undefined) update.tokens = patch.tokens;
  await db
    .update(schema.designSystem)
    .set(update)
    .where(
      and(
        eq(schema.designSystem.id, id),
        eq(schema.designSystem.userId, user.id),
      ),
    );
  revalidatePath("/systems");
  revalidatePath(`/systems/${id}`);
}

export async function deleteDesignSystemAction(id: string): Promise<void> {
  const user = await requireUser();
  // Clear any project references first — FK is text without cascade.
  await db
    .update(schema.project)
    .set({ designSystemId: null })
    .where(
      and(
        eq(schema.project.userId, user.id),
        eq(schema.project.designSystemId, id),
      ),
    );
  await db
    .delete(schema.designSystem)
    .where(
      and(
        eq(schema.designSystem.id, id),
        eq(schema.designSystem.userId, user.id),
      ),
    );
  revalidatePath("/systems");
}

export async function setProjectDesignSystemAction(
  projectId: string,
  designSystemId: string | null,
): Promise<void> {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  if (designSystemId) {
    const [row] = await db
      .select({ id: schema.designSystem.id })
      .from(schema.designSystem)
      .where(
        and(
          eq(schema.designSystem.id, designSystemId),
          eq(schema.designSystem.userId, user.id),
        ),
      )
      .limit(1);
    if (!row) throw new Error("system_not_found");
  }
  await db
    .update(schema.project)
    .set({ designSystemId, updatedAt: new Date() })
    .where(eq(schema.project.id, projectId));
  revalidatePath(`/p/${projectId}`);
  revalidatePath(`/p/${projectId}/brand`);
}

export async function saveBrandAsSystemAction(
  projectId: string,
  name: string,
): Promise<{ id: string }> {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const [proj] = await db
    .select({ brandTokens: schema.project.brandTokens })
    .from(schema.project)
    .where(eq(schema.project.id, projectId))
    .limit(1);
  if (!proj?.brandTokens) throw new Error("no_brand");
  const id = rid("ds");
  await db.insert(schema.designSystem).values({
    id,
    userId: user.id,
    name: name.trim() || "Untitled system",
    tokens: proj.brandTokens,
  });
  await db
    .update(schema.project)
    .set({ designSystemId: id, updatedAt: new Date() })
    .where(eq(schema.project.id, projectId));
  revalidatePath("/systems");
  revalidatePath(`/p/${projectId}/brand`);
  return { id };
}

export async function ingestBrandAction(
  projectId: string,
  input: { kind: "site" | "image"; url: string },
): Promise<{ ok: true; tokens: import("@/lib/ai/scrapers/brand-ingest").BrandTokens }> {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const url = input.url.trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("invalid_url");
  const { ingestFromSite, ingestFromImage } = await import(
    "@/lib/ai/scrapers/brand-ingest"
  );
  const tokens =
    input.kind === "site" ? await ingestFromSite(url) : await ingestFromImage(url);
  await db
    .update(schema.project)
    .set({ brandTokens: tokens, brandApply: true, updatedAt: new Date() })
    .where(eq(schema.project.id, projectId));
  revalidatePath(`/p/${projectId}`);
  revalidatePath(`/p/${projectId}/brand`);
  return { ok: true, tokens };
}

export async function setBrandApplyAction(projectId: string, on: boolean) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  await db
    .update(schema.project)
    .set({ brandApply: on, updatedAt: new Date() })
    .where(eq(schema.project.id, projectId));
  revalidatePath(`/p/${projectId}`);
}

export async function clearBrandAction(projectId: string) {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  await db
    .update(schema.project)
    .set({ brandTokens: null, brandApply: false, updatedAt: new Date() })
    .where(eq(schema.project.id, projectId));
  revalidatePath(`/p/${projectId}`);
  revalidatePath(`/p/${projectId}/brand`);
}

// ── User settings ───────────────────────────────────────────────
import {
  encryptSecret,
  decryptSecret,
  hasAppSecret,
} from "@/lib/security/crypto";

export type CustomModel = { id: string; label: string };
export type UserSettings = {
  selectedModelId: string | null;
  customModels: CustomModel[];
  openRouterKeyPreview: string | null; // masked; never return full key
  hasAppSecret: boolean;
};

export async function getUserSettings(): Promise<UserSettings> {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, user.id))
    .limit(1);
  const customs = (row?.customModels as CustomModel[] | null) ?? [];
  let preview: string | null = null;
  if (row?.encOpenrouterKey && hasAppSecret()) {
    try {
      const plain = decryptSecret(row.encOpenrouterKey);
      preview = plain.slice(0, 6) + "…" + plain.slice(-4);
    } catch {
      preview = null;
    }
  }
  return {
    selectedModelId: row?.selectedModelId ?? null,
    customModels: customs,
    openRouterKeyPreview: preview,
    hasAppSecret: hasAppSecret(),
  };
}

export async function setSelectedModelAction(modelId: string | null) {
  const user = await requireUser();
  await db
    .insert(schema.userSettings)
    .values({
      userId: user.id,
      selectedModelId: modelId,
      customModels: [],
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.userSettings.userId,
      set: { selectedModelId: modelId, updatedAt: new Date() },
    });
  revalidatePath("/settings");
}

export async function addCustomModelAction(input: {
  id: string;
  label?: string;
}) {
  const user = await requireUser();
  const id = input.id.trim();
  if (!id || !/^[a-z0-9][a-z0-9-_/.:]+$/i.test(id)) {
    throw new Error("invalid_model_id");
  }
  const label = (input.label?.trim() || id).slice(0, 60);
  const [row] = await db
    .select()
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, user.id))
    .limit(1);
  const existing = (row?.customModels as CustomModel[] | null) ?? [];
  if (existing.some((m) => m.id === id)) return;
  const next = [...existing, { id, label }];
  if (row) {
    await db
      .update(schema.userSettings)
      .set({ customModels: next, updatedAt: new Date() })
      .where(eq(schema.userSettings.userId, user.id));
  } else {
    await db.insert(schema.userSettings).values({
      userId: user.id,
      customModels: next,
      updatedAt: new Date(),
    });
  }
  revalidatePath("/settings");
}

export async function removeCustomModelAction(id: string) {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, user.id))
    .limit(1);
  if (!row) return;
  const existing = (row.customModels as CustomModel[] | null) ?? [];
  const next = existing.filter((m) => m.id !== id);
  const unselect = row.selectedModelId === id;
  await db
    .update(schema.userSettings)
    .set({
      customModels: next,
      selectedModelId: unselect ? null : row.selectedModelId,
      updatedAt: new Date(),
    })
    .where(eq(schema.userSettings.userId, user.id));
  revalidatePath("/settings");
}

export async function setOpenRouterKeyAction(key: string) {
  const user = await requireUser();
  if (!hasAppSecret()) throw new Error("no_app_secret");
  const trimmed = key.trim();
  const enc = trimmed ? encryptSecret(trimmed) : null;
  await db
    .insert(schema.userSettings)
    .values({
      userId: user.id,
      encOpenrouterKey: enc,
      customModels: [],
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.userSettings.userId,
      set: { encOpenrouterKey: enc, updatedAt: new Date() },
    });
  revalidatePath("/settings");
}

export async function clearOpenRouterKeyAction() {
  const user = await requireUser();
  await db
    .update(schema.userSettings)
    .set({ encOpenrouterKey: null, updatedAt: new Date() })
    .where(eq(schema.userSettings.userId, user.id));
  revalidatePath("/settings");
}

export type ApiKeyStatus = {
  hasServerKey: boolean;
  hasUserKey: boolean;
  hasAnyKey: boolean;
};

export async function getApiKeyStatus(): Promise<ApiKeyStatus> {
  const user = await requireUser();
  const cfg = await resolveUserAiConfig(user.id);
  const hasServerKey = !!process.env.OPENROUTER_API_KEY;
  const hasUserKey = !!cfg.apiKey;
  return { hasServerKey, hasUserKey, hasAnyKey: hasServerKey || hasUserKey };
}

// Resolves effective {modelId, apiKey} for a user. Server-only; returns the
// decrypted key. Callers must NOT leak this to the browser.
export async function resolveUserAiConfig(
  userId: string,
): Promise<{ modelId: string | null; apiKey: string | null }> {
  const [row] = await db
    .select()
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, userId))
    .limit(1);
  let apiKey: string | null = null;
  if (row?.encOpenrouterKey && hasAppSecret()) {
    try {
      apiKey = decryptSecret(row.encOpenrouterKey);
    } catch {
      apiKey = null;
    }
  }
  return {
    modelId: row?.selectedModelId ?? null,
    apiKey,
  };
}

export async function getArtifactIdsForVersion(
  projectId: string,
  version: number,
): Promise<{ id: string; variant: number }[]> {
  const user = await requireUser();
  await assertProjectOwner(projectId, user.id);
  const rows = await db
    .select({ id: schema.artifact.id, variant: schema.artifact.variant })
    .from(schema.artifact)
    .where(
      and(
        eq(schema.artifact.projectId, projectId),
        eq(schema.artifact.version, version),
      ),
    );
  return rows;
}
