# OpenDesign

Open-source AI design canvas. Prompt a screen, slide deck, or wireframe, iterate by chat, refine by drag, export as HTML / PDF / Next.js.

Built as an open alternative to closed AI design tools — bring any OpenRouter model, pin your own brand, run the whole stack locally.

## Features

- **Prompt → editable artifact.** Chat a brief, the agent researches references, synthesises a concept, renders a full-document HTML artifact.
- **Intake questions.** Vague first brief? The agent asks 3–6 pill-based scoped questions before generating.
- **Slide decks.** `outputType: slides` emits 5–8 cohesive slides as separate artifacts. DeckStrip navigates with arrow keys.
- **Wireframe / high-fidelity modes.** Fidelity flag stacks a grayscale-only prompt for wireframes.
- **Explore.** One-click "generate 3 alternative directions" — different layout, palette, vibe for each. Pick one, continue iterating on it, discard the rest.
- **Variant compare.** Double-click any variant to A/B with active one.
- **Visual editor.** Inline edit text, drag/resize elements via Moveable overlay, inspect computed styles.
- **Comments.** Pin comments to a leaf element or anchor on the canvas. Apply → agent refines that spot.
- **Controls.** Artifact emits sliders/toggles — tweak → chat back a regeneration summary.
- **Design systems.** Reusable brand tokens (palette, type, mood) linked per project.
- **Brand ingest.** Point at a URL or drop an image — scrape palette/type/mood into project-scoped brand tokens.
- **Share links.** Opt-in read-only public slug per project.
- **Settings / model registry.** Pick any OpenRouter preset, paste a custom tag (`openai/gpt-5`, `x-ai/grok-4`, etc.), store your own API key AES-256-GCM encrypted.
- **API-key gate.** No env or user key → app shows banner, disables send, links to Settings.
- **Mobile responsive.** Home stacks on small screens; workspace gets a Chat/Canvas toggle.
- **Full SEO.** Per-page metadata, dynamic OG image, robots, sitemap, manifest, icons.

## Stack

- **Next.js 16** (App Router, React 19, Tailwind v4, Turbopack)
- **TypeScript** strict
- **Bun** package manager + runtime
- **Drizzle ORM** + **Neon Postgres**
- **Better Auth** (email/password sessions)
- **Vercel AI SDK v6** (`ToolLoopAgent`, `useChat`, `createAgentUIStreamResponse`)
- **OpenRouter** via `@openrouter/ai-sdk-provider` — default `anthropic/claude-sonnet-4-5`
- **Moveable.js** for DOM-level drag/resize
- **html2canvas-pro** + **jsPDF** for export

## Quick start

```bash
bun install
cp .env.example .env.local    # fill in values
bunx drizzle-kit migrate
bun dev
```

Open http://localhost:3000.

### Required env vars

```
DATABASE_URL=postgres://…          # Neon / any Postgres
BETTER_AUTH_SECRET=…               # 32+ chars
OPENROUTER_API_KEY=sk-or-v1-…      # optional — users can supply their own in /settings
APP_SECRET=…                       # 16+ chars, used to AES-encrypt user-stored API keys
NEXT_PUBLIC_SITE_URL=https://…     # production URL for OG/sitemap/canonical
```

If `OPENROUTER_API_KEY` is absent and the user hasn't stored one, the chat route returns `428 no_api_key` and the UI prompts them to visit Settings.

## Architecture

```
app/
  api/chat/route.ts          Stream endpoint. Builds per-request agent with user key + fidelity/output prompts.
  p/[id]/                    Workspace (chat + canvas, brand editor, sharing).
  s/[slug]/                  Public read-only artifact viewer.
  settings/                  Model picker + encrypted API key UI.
  systems/                   Design system CRUD.
  robots.ts | sitemap.ts | manifest.ts | opengraph-image.tsx

lib/
  ai/
    agent.ts                 buildDesignAgent({modelId, apiKey, instructions}) factory.
    tools.ts                 emit_artifact, ask_intake_questions, research, interpret_image, scrape_brand.
    system.ts                SYSTEM_PROMPT + WIREFRAME_PROMPT + SLIDES_PROMPT.
    scrapers/                brand-ingest, interpret-image (per-call key override).
  db/schema.ts               project, artifact, message, comment, designSystem, userSettings, share.
  security/crypto.ts         AES-256-GCM via APP_SECRET-derived key.
  share.ts                   Public slug resolver, rotation, revoke.
  actions.ts                 Server actions — session-cached requireUser, CRUD, user settings.

components/
  home/                      HomeComposer, ProjectsPanel, HomeHeader, GuestLanding.
  workspace/                 TopBar, ChatPane, CanvasPane, VariantStrip, DeckStrip,
                             Inspector, CommentOverlay, EditBar, ControlsPanel,
                             IntakeForm, MessageBubble.
  settings/                  SettingsForm.
  systems/                   SystemsList, SystemEditor.
  api-key-gate-banner.tsx
```

### How a turn works

1. User sends message → `POST /api/chat` with projectId + UIMessages.
2. Route resolves `resolveUserAiConfig(userId)` → `{modelId, apiKey}`. If both are empty and no env key, returns 428.
3. If project has brand tokens / wireframe / slides / custom user config, `buildDesignAgent(...)` produces a per-request `ToolLoopAgent`; otherwise reuses the module-level singleton.
4. `createAgentUIStreamResponse` streams. `onStepFinish` intercepts `emit_artifact` tool calls, persists rows into `artifact` with monotonically increasing `version` per turn and `variant` per emission in that turn.
5. `onFinish` persists final assistant UIMessage and bumps `project.updatedAt`.

Slide decks reuse the variant column — each `emit_artifact` in one turn becomes a slide. DeckStrip swaps in for VariantStrip when `outputType === "slides"`.

### Variant lock-in

After a multi-emit turn (Explore or a fresh deck), click **Continue with this →** on the active variant. It sends a `metadata.intent: "pick"` user message telling the model to discard alternatives and iterate only on the chosen artifact. Message renders as a compact pill in chat.

### Security

- Session cookies via Better Auth; `requireUser` throws → redirect to `/login?next=…`.
- User API keys encrypted AES-256-GCM with a key derived `sha256(APP_SECRET)`. Never returned to the client — Settings only shows `sk-or…abcd` preview.
- Brand-scrape and interpret-image helpers accept an `apiKey` override so per-user keys don't leak across requests.

## Scripts

```bash
bun dev                # Next dev (Turbopack) on :3000
bun run build          # Production build
bun start              # Serve built app
bunx drizzle-kit generate
bunx drizzle-kit migrate
bunx tsc --noEmit      # Typecheck
bun run lint
```

## SEO

- `metadataBase` + title template in root layout
- Dynamic OG image at `/opengraph-image` (edge ImageResponse)
- `robots.ts` allows `/`, `/login`, `/signup`, `/s/[slug]`; blocks `/api/`, `/settings`, `/systems`, `/p/`, `/mockup`
- `sitemap.ts` + `manifest.ts`
- `noindex` on private routes; public share pages index with artifact title

Set `NEXT_PUBLIC_SITE_URL` in prod — falls back to `https://freeclaudedesign.com`.

## License

MIT.
