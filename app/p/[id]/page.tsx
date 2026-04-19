import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { Workspace } from "@/components/workspace/workspace";
import { getProject, getSessionUser } from "@/lib/actions";
import {
  getExistingShareSlug,
  getOrCreateShareLink,
  revokeShareLink,
} from "@/lib/share";
import { db, schema } from "@/lib/db";
import { coerceControls } from "@/lib/workspace/controls";
import type { UIMessage } from "ai";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, user] = await Promise.all([getProject(id), getSessionUser()]);
  if (!project) notFound();

  const [rawMessages, allArtifacts, shareSlug] = await Promise.all([
    db
      .select()
      .from(schema.message)
      .where(eq(schema.message.projectId, id))
      .orderBy(asc(schema.message.createdAt)),
    db
      .select()
      .from(schema.artifact)
      .where(eq(schema.artifact.projectId, id))
      .orderBy(desc(schema.artifact.version), asc(schema.artifact.variant)),
    getExistingShareSlug(id),
  ]);

  const initialMessages: UIMessage[] = rawMessages.map(
    (row) => row.content as UIMessage,
  );
  const latestVersion = allArtifacts[0]?.version;
  const latestGroup = latestVersion
    ? allArtifacts.filter((a) => a.version === latestVersion)
    : [];
  const initialArtifacts = latestGroup.map((row) => {
    const sidecar = row.sidecar as
      | { title?: string; controls?: unknown }
      | null;
    return {
      id: row.id,
      html: row.html,
      title: sidecar?.title,
      version: row.version,
      variant: row.variant,
      controls: coerceControls(sidecar?.controls),
    };
  });

  return (
    <Workspace
      projectId={project.id}
      projectTitle={project.title}
      userEmail={user?.email}
      initialMessages={initialMessages}
      initialArtifacts={initialArtifacts}
      initialShareSlug={shareSlug}
      brandApply={project.brandApply}
      createShareAction={async (pid: string) => {
        "use server";
        return getOrCreateShareLink(pid);
      }}
      revokeShareAction={async (pid: string) => {
        "use server";
        await revokeShareLink(pid);
      }}
    />
  );
}
