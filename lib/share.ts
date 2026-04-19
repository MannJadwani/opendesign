"use server";

import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/actions";
import { rid } from "@/lib/util/id";
import { and, desc, eq } from "drizzle-orm";

function slug() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 14);
}

export async function getOrCreateShareLink(projectId: string) {
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

  const [existing] = await db
    .select()
    .from(schema.shareLink)
    .where(eq(schema.shareLink.projectId, projectId))
    .limit(1);
  if (existing) return { slug: existing.slug };

  const s = slug();
  await db.insert(schema.shareLink).values({
    id: rid("shr"),
    projectId,
    slug: s,
    canComment: false,
  });
  return { slug: s };
}

export async function revokeShareLink(projectId: string) {
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
  if (!project) return;
  await db
    .delete(schema.shareLink)
    .where(eq(schema.shareLink.projectId, projectId));
}

export async function getExistingShareSlug(projectId: string) {
  const user = await requireUser();
  const [row] = await db
    .select({ slug: schema.shareLink.slug })
    .from(schema.shareLink)
    .innerJoin(
      schema.project,
      eq(schema.project.id, schema.shareLink.projectId),
    )
    .where(
      and(
        eq(schema.shareLink.projectId, projectId),
        eq(schema.project.userId, user.id),
      ),
    )
    .limit(1);
  return row?.slug ?? null;
}

export async function loadSharedArtifact(slugValue: string) {
  const [row] = await db
    .select({
      projectId: schema.shareLink.projectId,
      title: schema.project.title,
    })
    .from(schema.shareLink)
    .innerJoin(
      schema.project,
      eq(schema.project.id, schema.shareLink.projectId),
    )
    .where(eq(schema.shareLink.slug, slugValue))
    .limit(1);
  if (!row) return null;

  const [art] = await db
    .select()
    .from(schema.artifact)
    .where(eq(schema.artifact.projectId, row.projectId))
    .orderBy(desc(schema.artifact.version))
    .limit(1);

  if (!art) return { title: row.title, html: null, version: 0 };
  return { title: row.title, html: art.html, version: art.version };
}
