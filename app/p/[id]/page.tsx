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
import type { UIMessage } from "ai";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, user] = await Promise.all([getProject(id), getSessionUser()]);
  if (!project) notFound();

  const [rawMessages, artifacts, shareSlug] = await Promise.all([
    db
      .select()
      .from(schema.message)
      .where(eq(schema.message.projectId, id))
      .orderBy(asc(schema.message.createdAt)),
    db
      .select()
      .from(schema.artifact)
      .where(eq(schema.artifact.projectId, id))
      .orderBy(desc(schema.artifact.version))
      .limit(1),
    getExistingShareSlug(id),
  ]);

  const initialMessages: UIMessage[] = rawMessages.map(
    (row) => row.content as UIMessage,
  );
  const latest = artifacts[0];
  const initialArtifact = latest
    ? {
        html: latest.html,
        title: (latest.sidecar as { title?: string } | null)?.title,
        version: latest.version,
      }
    : null;

  return (
    <Workspace
      projectId={project.id}
      projectTitle={project.title}
      userEmail={user?.email}
      initialMessages={initialMessages}
      initialArtifact={initialArtifact}
      initialShareSlug={shareSlug}
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
