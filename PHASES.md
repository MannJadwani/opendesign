# Implementation Phases — Claude Design Clone

Execution plan for PRD.md. Each phase = shippable slice. Phases map 1:1 to milestones M0–M8 in §9 of PRD.

**Stack baseline (already in repo):** Next.js 16.2.4 (App Router), React 19.2.4, Tailwind v4, TypeScript. `AGENTS.md` warns: Next.js APIs may differ from training data → read `node_modules/next/dist/docs/01-app/` before using any Next feature.

**Added in P0:** Neon Postgres + Prisma, Better Auth, Anthropic SDK, Moveable/Selecto, shadcn/ui.

---

## Phase 0 — Foundation

**Goal:** Repo scaffold + auth + workspace shell rendering. No AI yet.

**Tasks**
- Read `node_modules/next/dist/docs/01-app/` sections for: routing, server actions, streaming, route handlers, middleware. Note any API drift.
- Install deps: `ai` (Vercel AI SDK), `@openrouter/ai-sdk-provider`, `@ai-sdk/react` (for `useChat` on client), `better-auth`, `@prisma/client`, `@neondatabase/serverless`, `moveable`, `selecto`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`. Dev: `prisma`.
- Add shadcn (`npx shadcn@latest init`) + primitives: button, input, dialog, sheet, dropdown-menu, tabs, tooltip, form, label.
- **Neon setup:** create Neon project → copy pooled + direct connection strings → `.env.local` as `DATABASE_URL` (pooled for runtime) + `DIRECT_URL` (direct for migrations).
- **Prisma:** `prisma init`. `datasource` uses `url = env("DATABASE_URL")` + `directUrl = env("DIRECT_URL")`. Schema:
  - Better Auth tables: `User`, `Session`, `Account`, `Verification` (follow Better Auth's Prisma schema).
  - App tables: `Project { id, userId, title, brandSystemId? }`, `Message { id, projectId, role, content, attachments }`, `Artifact { id, projectId, html, sidecarJson, createdAt }`, `DesignSystem { id, userId, tokens, components }`, `ShareLink { id, projectId, token, mode: 'view'|'edit', expiresAt }`, `Comment { id, artifactId, elementId, x, y, text, resolved }`, `Call { id, projectId, promptTokens, completionTokens, cacheReadTokens, latencyMs, model }`.
  - Relations + cascades. Run `prisma migrate dev`.
- **Better Auth setup:**
  - `lib/auth.ts` — `betterAuth({ database: prismaAdapter(prisma, { provider: 'postgresql' }), emailAndPassword: { enabled: true }, socialProviders: { google: {...}, github: {...} } })`.
  - Route handler `app/api/auth/[...all]/route.ts` exporting `toNextJsHandler(auth)`.
  - `lib/auth-client.ts` — `createAuthClient()` for client-side `signIn`, `signOut`, `useSession`.
  - Middleware in `middleware.ts` gating `/p/*` and `/settings` to authed users. Read Next 16 middleware docs first.
- Routes:
  - `/` — marketing / logged-out landing + logged-in project list.
  - `/login`, `/signup` — Better Auth forms.
  - `/p/[id]` — project workspace (split view), user-scoped.
  - `/s/[token]` — public share view (no auth).
  - `/settings` — profile + API key (optional user-supplied Anthropic key) + sign out.
- Workspace shell: left pane (chat list, empty), right pane (iframe placeholder), top bar (title, share stub, export stub, user menu).
- Theme: Tailwind tokens for Anthropic-ish palette (warm neutrals, orange accent). Serif display + sans body.
- Env: `.env.local` → `OPENROUTER_API_KEY`, `APIFY_TOKEN`, `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`.

**Deliverables:** Auth flows (email + Google + GitHub) work. `/`, `/p/[id]`, `/settings`, `/login`, `/signup` render. Neon migrated.

**Acceptance:** `npm run dev` → sign up with email → lands home → create project → workspace shell renders with your user in top bar. Sign out → `/p/[id]` redirects to `/login`. Lint + typecheck clean.

---

## Phase 1 — Generation (F1) + Design Agent skeleton

**Goal:** Prompt → Vercel AI SDK tool-loop agent (OpenRouter → Claude Opus 4.7) → HTML in iframe. Streaming. Research pipeline stubs land here; real MCP tools land in P1.5.

**Tasks**
- `lib/ai.ts` — create OpenRouter provider:
  ```ts
  import { createOpenRouter } from '@openrouter/ai-sdk-provider';
  export const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
  export const opus = openrouter.chat('anthropic/claude-opus-4.7');
  export const sonnet = openrouter.chat('anthropic/claude-sonnet-4.6');
  ```
- `lib/agent/tools.ts` — define tool-loop tools with `tool()` from `ai`:
  - `search_pinterest` (stub returning fixtures)
  - `search_components` (stub)
  - `fetch_image` (real — HTTP)
  - `interpret_image` (real — nested `generateObject` with Opus vision + zod schema)
  - `synthesize_concept` (real — nested `generateObject`)
  - `emit_artifact` (terminal — zod schema `{ html: string, sidecar: {...} }`)
  - `apply_design_system` (local lookup)
- `lib/agent/run.ts` — orchestrator:
  ```ts
  import { streamText, stepCountIs, hasToolCall } from 'ai';
  export const runDesignAgent = ({ messages, projectId }) => streamText({
    model: opus,
    system: DESIGN_AGENT_SYSTEM,
    tools,
    messages,
    stopWhen: [stepCountIs(12), hasToolCall('emit_artifact')],
    experimental_telemetry: { isEnabled: true },
  });
  ```
  Read Vercel AI SDK 5+ docs for current tool-loop API; names drift.
- Route handler `POST /app/api/generate/route.ts`: calls `runDesignAgent`, returns `result.toUIMessageStreamResponse()`.
- Client: chat input in left pane using `useChat` from `@ai-sdk/react` pointed at `/api/generate`. Render tool calls in the chat as "thinking steps" (searching Pinterest / interpreting 3 images / synthesizing…).
- When the stream yields a successful `emit_artifact` tool result → pipe its `html` into iframe via `srcdoc`. Persist sidecar JSON on `Artifact`.
- Iframe wrapper: `<iframe sandbox="allow-scripts" srcdoc={html}>`. Viewport toggles (1440 / 768 / 390).
- Persist: `Message`, `Artifact`, one `Call` row per step (model, tokens, latency).
- First-turn vs follow-up: detect follow-up (prior `Artifact` exists for project) → pass a flag in system prompt telling agent to skip research tools.

**Deliverables:** F1 works. Tool loop visible in chat. Agent still uses stubbed research tools — real MCPs wired in P1.5.

**Acceptance:** Type "landing page for a meditation app" → chat shows agent calling tools (stubs) → `emit_artifact` fires → iframe renders styled page within ~20s. Follow-up ("dark mode") skips research and returns faster.

---

## Phase 1.5 — Real research tools via MCP (Apify + component libs)

**Goal:** Replace stubs with real Apify MCP + component-library searches.

**Tasks**
- `lib/agent/mcp.ts` — spin up MCP clients with AI SDK `experimental_createMCPClient`:
  - Apify MCP (one server covers Pinterest, Dribbble, Behance scrapers).
  - Optional: shadcn / Radix / Tailwind UI catalog MCPs if available; otherwise keep `search_components` as a local JSON index over curated component docs.
- Merge MCP-provided tools into the tool-loop `tools` object alongside local tools.
- `search_pinterest` real impl: call Apify Pinterest actor with query + count. Return `[{ imageUrl, sourceUrl, title, pinId }]`.
- `search_components` real impl: either MCP-driven or local keyword index returning `[{ lib, name, snippet, propsDoc }]`.
- Add `Inspiration` table rows for every fetched reference.
- Rate limit + cache: hash `(tool, argsJson)` → cache Apify results for 24h in a `ToolCache` table. Major cost saver.
- Cost guard: cap agent to N Apify calls per user per hour.

**Deliverables:** Real Pinterest references show up in agent thinking steps; generated artifact reflects them.

**Acceptance:** "mobile onboarding for fintech app" → agent pulls 5 Pinterest pins → interprets → synthesizes → outputs phone-frame HTML visibly inspired (not copied) from references. Inspiration URLs stored per artifact.

---

## Phase 2 — Chat refine + rich inputs (F2, F8)

**Goal:** Follow-up turns patch the artifact. Image + file uploads as context.

**Tasks**
- Multi-turn: each generation request sends prior messages + current artifact as context. System prompt: "return full new HTML, preserving unchanged sections; keep `data-cd-id` stable where possible."
- Artifact diffing: diff old vs new `data-cd-id` sets → animate removed/added blocks in preview.
- Attachments: drag-drop onto chat input. Images → SDK `image` content block. DOCX/PPTX/XLSX → extract text server-side (`mammoth` / `pptx-parser` / `xlsx`) → inject as text content. Cap size.
- Store attachments as blobs (local filesystem MVP; S3 post-MVP).

**Deliverables:** F2, F8 working.

**Acceptance:** Generate artifact → "make it dark mode" → iframe updates without layout loss. Drop screenshot → "match this style" → new generation reflects it.

---

## Phase 3 — Visual editor: transform + text (F4, F4b)

**Goal:** Click element → select → edit inline or transform.

**Tasks**
- Inject `editor-bridge.ts` script into iframe via `srcdoc` wrapper. Responsibilities:
  - Listen for clicks → resolve target → read `data-cd-id` + bbox → `postMessage({type: 'select', id, bbox, tagName})`.
  - Accept `postMessage({type: 'set-style', id, style})` → write inline style.
  - Accept `{type: 'enable-text-edit', id}` → set `contenteditable=true`, focus. On blur → `postMessage({type: 'text-commit', id, text})`.
- Parent app: overlay layer absolutely positioned over iframe. Mount Moveable on selected element's bbox (proxy div, since Moveable needs a real DOM node in parent doc → use a transparent ghost div mirroring iframe bbox, OR mount Moveable inside iframe and relay).
- Decision: **mount Moveable inside iframe** (simpler, no bbox sync). Parent renders right-side inspector panel reading current styles via `postMessage`.
- Selecto for marquee multi-select (future).
- Text edits: double-click text node → contenteditable on. On commit → patch artifact HTML server-side → update `Message`/`Artifact`.
- All local edits feed back into conversation ("user edited element X: padding 16→24") so next chat turn has context.

**Deliverables:** F4, F4b.

**Acceptance:** Click hero → handles appear → drag to resize → artifact persists. Double-click heading → edit text → save. Chat turn after edit preserves changes.

---

## Phase 4 — Inline comments on canvas (F3)

**Goal:** Pin a comment on an element, Claude refines based on it.

**Tasks**
- New mode toggle: "Comment" in top bar.
- Click anywhere on canvas in comment mode → bridge script `postMessage` with `{x, y, closestId}` → parent places a pin overlay + popover for comment text.
- Persist `Comment { artifactId, elementId, x, y, text, resolved }`.
- "Apply comment" → send Claude message: "user commented on element `data-cd-id=X`: '...'; update the artifact accordingly." On success → mark resolved.

**Deliverables:** F3.

**Acceptance:** Pin comment "too cramped" on hero → click apply → hero spacing increases in next gen.

---

## Phase 5 — Slider refinement (F5)

**Goal:** Claude-emitted adjustable params become live sliders.

**Tasks**
- Extend system prompt: sidecar JSON includes `controls: [{id, label, target: 'data-cd-id', cssVar | styleProp, min, max, step, unit, current}]`.
- Inspector panel reads `controls` → renders sliders grouped by element.
- Slider change → `postMessage({type: 'set-style', ...})` → instant preview. Debounced → append "user adjusted X to Y" to conversation history (not as new Claude call until user hits "regenerate with these values").
- Presets: "save snapshot" captures current control values as a named variant.

**Deliverables:** F5.

**Acceptance:** Claude emits `hero.paddingY` slider. Dragging it visibly changes hero padding in real time.

---

## Phase 6 — Variants (F6)

**Goal:** Generate N alternate directions, pick one.

**Tasks**
- "Explore alternatives" button in workspace.
- `POST /api/variants` → fires N (default 3) parallel generations with same prompt + temperature bump. Uses prompt caching on the system prefix to cut cost.
- Variants strip below canvas: thumbnails (mini iframes at 25% scale, non-interactive).
- Click variant → promote to main artifact; others archive under project.
- Compare mode: side-by-side 2-up.

**Deliverables:** F6.

**Acceptance:** Hit "explore" → 3 distinct layouts return in one parallel batch. Promote one → becomes current.

---

## Phase 7 — Brand / design-system ingest (F7)

**Goal:** Project-scoped design system auto-applied to every generation.

**Tasks**
- New screen `/p/[id]/brand`: upload design files (images, PDFs, CSS) + paste repo URL.
- Repo ingest: clone shallow → scan for `tailwind.config.*`, `tokens.json`, CSS custom properties, common component files. Extract palette, type scale, spacing scale, component names. Store as `DesignSystem { tokens, components, examples }`.
- File ingest: images → Claude vision call to extract palette + style description. CSS → regex tokens.
- Inject into system prompt as a cached prefix: tokens + example components + "use only these tokens".
- Toggle per project: "Apply brand system". Off = free generation.

**Deliverables:** F7.

**Acceptance:** Upload a brand image → next generation uses extracted palette. Pasting a Tailwind config → generations use those token names.

---

## Phase 8 — Export + share (F9, F10)

**Goal:** Get the design out.

**Tasks**
- HTML export: download full `<html>` doc as `.html`.
- PDF export: server route spins Playwright / Puppeteer, loads `srcdoc`, `page.pdf()`. Queue job if slow.
- Share link: generate signed token → `/s/[token]` read-only view of latest artifact. Access control: `private | view | edit` stored on `ShareLink`.
- Export dialog UI with format cards. Greyed-out cards for Canva / PPTX / Claude Code handoff with "coming soon".

**Deliverables:** F9, F10.

**Acceptance:** Click export → HTML downloads and opens standalone. PDF renders at A4 with no scroll artifacts. Share link opens in incognito.

---

## Phase 9+ — Post-MVP backlog

Tracked but not scheduled:

- Canva direct integration (OAuth + API push).
- PPTX export (python-pptx via worker, or `pptxgenjs` client-side).
- Claude Code handoff bundle (zip: HTML + assets + `CLAUDE.md` with build instructions).
- Web-capture tool (paste URL → headless browser → extract DOM/CSS/assets).
- Real-time multi-user presence (Liveblocks or Yjs).
- Org admin, SSO (Better Auth organization plugin), role-based sharing.
- Voice/video/shader/3D code-powered prototypes.
- Billing + usage metering (Stripe).

---

## Cross-cutting concerns

- **Prompt caching:** cache the static system prefix + design-system tokens. Recompute when brand changes.
- **Cost cap:** per-project token budget in settings; surface remaining budget in UI.
- **Observability:** log every Claude call (prompt tokens, completion tokens, latency, model, cache hits) into a `Call` table.
- **Security:** iframe `sandbox="allow-scripts"` (no `allow-same-origin` unless we need bridge script — if we do, accept the tradeoff and never load user-supplied HTML without also stripping `<script>` unless trusted Claude output).
- **Testing:** Playwright e2e on the generate → edit → export happy path. Vitest for parser (HTML/JSON block extraction).
