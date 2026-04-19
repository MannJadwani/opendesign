import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  doublePrecision,
  index,
} from "drizzle-orm/pg-core";

// ── Better Auth tables ──────────────────────────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── App tables ──────────────────────────────────────────────────
export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled"),
    outputType: text("output_type").notNull().default("website"), // website|mobile|slides|carousel|wireframe
    designSystemId: text("design_system_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("project_user_idx").on(t.userId)],
);

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // user|assistant|tool|system
    content: jsonb("content").notNull(), // AI SDK UIMessage parts
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("message_project_idx").on(t.projectId)],
);

export const artifact = pgTable(
  "artifact",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1),
    variant: integer("variant").notNull().default(0),
    html: text("html").notNull(),
    sidecar: jsonb("sidecar"), // { title, controls, anchors, palette }
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("artifact_project_idx").on(t.projectId)],
);

export const designSystem = pgTable("design_system", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tokens: jsonb("tokens").notNull(), // { colors, type, radius, spacing }
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const shareLink = pgTable("share_link", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  canComment: boolean("can_comment").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const comment = pgTable(
  "comment",
  {
    id: text("id").primaryKey(),
    artifactId: text("artifact_id")
      .notNull()
      .references(() => artifact.id, { onDelete: "cascade" }),
    authorId: text("author_id").references(() => user.id, {
      onDelete: "set null",
    }),
    authorName: text("author_name"), // for guest commenters
    anchor: text("anchor"), // data-cd-id of nearest tagged block, if any
    leafId: text("leaf_id"), // runtime data-cd-leaf id, ephemeral — best-effort
    xPct: doublePrecision("x_pct"), // 0..1 of iframe body width
    yPct: doublePrecision("y_pct"), // 0..1 of iframe body height
    body: text("body").notNull(),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("comment_artifact_idx").on(t.artifactId)],
);

export const inspiration = pgTable(
  "inspiration",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // pinterest|upload|url
    url: text("url"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("inspiration_project_idx").on(t.projectId)],
);

export const toolCache = pgTable(
  "tool_cache",
  {
    key: text("key").primaryKey(), // sha of (tool, args)
    value: jsonb("value").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);
