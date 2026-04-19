# PRD — Claude Design Clone

**Status:** Draft
**Owner:** Mann Jadwani
**Date:** 2026-04-19
**Target:** Visual clone of `claude.ai/design` (Anthropic Labs, launched 2026-04-17)

---

## 1. Summary

Build a web app that mirrors the UX of Anthropic's Claude Design: a chat-driven visual-creation surface that turns natural-language prompts into prototypes, slides, one-pagers, and mockups. Scope of this clone is **frontend + light backend**; generation is powered by the Claude API (Opus 4.7).

## 2. Goals

- Reproduce the core Claude Design workflow: prompt → generated artifact → iterative refinement → export.
- Match look and feel of `claude.ai/design` (layout, typography, motion, empty states).
- Functional MVP: text-to-prototype output rendered as live HTML preview.
- Export to at least one format (HTML download) in MVP.
- Ship the **must-copy** features in §2.1 — these define the product identity.

### 2.1 Must-copy features (priority list)

The 8 things that make Claude Design *Claude Design*. Clone target is built around these.

1. **Chat + canvas layout** — chat on the left, live design canvas on the right; iterate via chat turns.
2. **Prompt-to-design generation** — designs, interactive prototypes, slides, wireframes, mockups, landing pages, social assets from natural language.
3. **Multi-mode refinement** (biggest differentiator):
   - refine via chat
   - inline comments anchored to elements on the canvas
   - direct text edits on the artifact
   - custom sliders/knobs that Claude generates for spacing, color, layout, etc.
4. **Automatic brand/design-system application** — ingest codebase + design files during onboarding, then auto-apply colors, typography, components to every future project.
5. **Rich input sources** — text prompts, screenshots, images, DOCX, PPTX, XLSX, existing assets, codebases, web-capture tool.
6. **Alternative explorations** — generate multiple design directions / alternate layouts in one shot.
7. **Collaboration & sharing** — private, org-shared, or edit access; teammates can modify and chat with Claude together.
8. **Export + handoff pipeline** — Canva, PDF, PPTX, standalone HTML, plus a Claude-Code handoff bundle (design-to-build bridge).

## 3. Non-Goals (MVP)

- Real-time multi-user presence / cursors.
- Enterprise admin controls, SSO, org-scoped sharing.
- Canva direct integration, PPTX export.
- Full web-capture tool (scrape + extract).
- Voice / video / shader / 3D code-powered prototypes.

These return as post-MVP milestones.

## 4. Target Users

- Primary: solo builders and PMs who want visuals without opening Figma.
- Secondary: designers iterating on early-stage explorations.
- Tertiary: developers generating prototypes for handoff.

## 5. Reference Feature Set (source of truth)

From Anthropic Labs launch post + press coverage:

| Area | Feature |
|---|---|
| Inputs | Text prompts, image uploads, DOCX/PPTX/XLSX uploads, codebase link, web capture |
| Generation | Prototypes, slides, one-pagers, wireframes, mockups, landing pages, code-powered prototypes (voice/video/shaders/3D) |
| Refinement | Inline edits, fine-grained spacing/color/layout controls, batch changes, live preview |
| Design system | Auto-apply brand from codebase + design files; multi-system support |
| Collaboration | Shared conversations, inline comments, view/edit access, org-scoped sharing |
| Export | URL, PDF, PPTX, standalone HTML, Canva handoff, Claude Code handoff bundle |
| Access | Pro / Max / Team / Enterprise; Opus 4.7 under the hood |

## 6. MVP Scope

Mapped to must-copy features in §2.1. Numbers in brackets reference those items.

### 6.1 Screens

1. **Home / New project** [2] — prompt box, example prompt chips, recent projects list, input attach menu (image / DOCX / PPTX / XLSX).
2. **Project workspace** [1] — split view:
   - Left: chat thread. Supports text, image, and file attachments [5].
   - Right: canvas with live artifact preview (iframe), viewport toggles (desktop / tablet / mobile), variant tabs [6].
   - Overlay mode: inline comment pins on canvas elements [3b].
   - Element-selected state: contextual Claude-generated sliders/knobs panel for spacing, color, layout [3d].
   - Top bar: project title, share menu [7], export menu [8].
3. **Variants strip** [6] — generate N alternates of current artifact, pick one to promote to main.
4. **Onboarding — Brand setup** [4] — paste a repo URL / upload design files → extract palette, type, components → save as project's design system.
5. **Export dialog** [8] — HTML + PDF in MVP; Canva / PPTX / Claude Code handoff bundle post-MVP (greyed with "coming soon").
6. **Settings** — API key entry (user supplies own Anthropic key), default design system.

### 6.2 Core flows

- **F1 — Generate** [2]: prompt + optional attachments → stream Claude response → render returned HTML/CSS in preview iframe.
- **F2 — Refine via chat** [3a]: follow-up message patches previous artifact → preview re-renders.
- **F3 — Inline comment refine** [3b]: user pins a comment to a canvas element → Claude receives the pin + element selector + comment → returns patched artifact.
- **F4 — Direct text edit** [3c]: click-to-edit text nodes on canvas via `contenteditable`; edits apply locally and feed back into conversation history.
- **F4b — Visual transform** [3c]: Selecto picks element → Moveable shows resize/drag/rotate handles → transforms write inline `style` on the element → artifact HTML updates.
- **F5 — Slider refinement** [3d]: Claude emits a JSON spec of adjustable params per artifact (e.g. `{hero.paddingY: {min, max}}`); UI renders sliders; changes re-prompt with new values.
- **F6 — Variants** [6]: "Explore alternatives" button → Claude returns N parallel designs → shown in variants strip.
- **F7 — Brand application** [4]: if a design system exists on the project, system prompt injects tokens (colors, fonts, components) so every generation respects brand.
- **F8 — File/image input** [5]: attach screenshot / doc → passed to Claude as image or extracted text.
- **F9 — Share link** [7]: generate a read-only URL (signed token) that loads the project artifact in view-only mode.
- **F10 — Export HTML / PDF** [8]: HTML download direct; PDF via headless-render of the iframe content.
- **F11 — Project list:** projects persist in Postgres (bumped from localStorage given share-link needs).

### 6.3 System prompt strategy

Claude returns a single self-contained HTML document (inline CSS, optional JS, Tailwind CDN allowed) **plus** a sidecar JSON block describing adjustable params and element anchors for comments. Parser:

1. Extracts HTML block → iframe `srcdoc`.
2. Extracts JSON block → populates sliders + comment-anchor map.
3. If a design system exists → prepend tokens + component examples to system prompt; cache that prefix (prompt caching).

## 7. Tech Stack

- **Framework:** Next.js (version in repo — read `node_modules/next/dist/docs/` before coding per AGENTS.md; APIs may differ from training data).
- **UI:** Tailwind + shadcn/ui for primitives. Icon set: lucide.
- **AI:** [Vercel AI SDK](https://ai-sdk.dev) with its **tool-loop agent** (`generateText` / `streamText` + `tools` + `stopWhen: stepCountIs(N)` / `hasToolCall('emit_artifact')`). Routed through [OpenRouter](https://openrouter.ai) via `@openrouter/ai-sdk-provider`. Default model: `anthropic/claude-opus-4.7` via OpenRouter; switchable per call (Sonnet for cheap steps, Opus for emit).
- **MCP clients:** AI SDK `experimental_createMCPClient` to connect Apify MCP + any component-library MCPs. Tools merged into the tool-loop.
- **Database:** [Neon](https://neon.tech) (serverless Postgres) + Prisma.
- **Auth:** [Better Auth](https://better-auth.com) — email/password + OAuth (Google, GitHub). Session cookies, CSRF built-in. Prisma adapter.
- **State:** React state + Neon Postgres from Phase 0 (auth + share links need it).
- **Preview sandbox:** `<iframe sandbox="allow-scripts" srcdoc={html}>`.
- **Visual editor:** [Moveable](https://github.com/daybrush/moveable) + [Selecto](https://github.com/daybrush/selecto) (daybrush).
  - Framework-agnostic, operates on any DOM incl. iframe contents.
  - Provides selection box, resize/drag/rotate handles, snapping, guides.
  - Wire: click → Selecto picks element → Moveable shows handles → transform event → patch inline `style` on target → `postMessage` back to parent → update artifact HTML + conversation state.
  - Text edits: toggle `contenteditable` on text nodes; flush on blur.
  - No data-model lock-in — Claude's raw HTML stays source of truth.

## 8. Visual / UX parity checklist

- Anthropic brand palette (off-white / warm neutrals, Claude orange accent).
- Serif display for hero, sans for body (Tiempos / Styrene equivalents or free substitutes).
- Chat bubbles minimal, no avatars on user side.
- Empty state with prompt-idea chips.
- Subtle motion on generation (shimmer on preview while streaming).

## 9. Milestones

| M | Scope | Must-copy refs |
|---|---|---|
| M0 | Repo scaffold, Tailwind, shadcn, home screen, split-view workspace shell | [1] |
| M1 | F1 generate, streaming, iframe preview, viewport toggles | [2] |
| M2 | F2 chat refine, F8 image + file attachments, project persistence (Postgres) | [3a][5] |
| M3 | F5 slider refinement (sidecar JSON spec), F4 direct text edit | [3c][3d] |
| M4 | F3 inline comments on canvas | [3b] |
| M5 | F6 variants strip ("explore alternatives") | [6] |
| M6 | F7 brand/design-system ingest (repo URL + file upload → tokens) | [4] |
| M7 | F10 HTML + PDF export, F9 share link (view-only) | [7][8] |
| M8+ | Canva integration, PPTX export, Claude Code handoff bundle, web-capture tool, org admin, real-time collab | [7][8] |

## 10. Risks

- **Legal:** visual clone of a live Anthropic product. Keep branding clearly marked as a clone / educational; don't use Anthropic wordmark or claim affiliation.
- **Model output variance:** HTML quality depends on prompt; invest in strong system prompt + few-shots.
- **Next.js version drift:** repo note says "this is NOT the Next.js you know" — read local docs before coding.
- **Cost:** Opus 4.7 is expensive; add prompt caching and a user-supplied-key mode.

## 11. Open questions

1. User-supplied API key vs. server-held key for MVP?
2. Do we need auth in MVP, or purely local browser state?
3. How close to pixel-parity do you want the landing page vs. good-enough?
4. In scope for this clone: the `/design` marketing page, the in-product workspace, or both?

## 12. Agent architecture

Core differentiator vs. plain prompt-to-HTML: a central **Design Agent** that does research before generation. Every first-time concept goes through the research pipeline so outputs are grounded in real design references and stay unique. Follow-up refinements skip research and hit a fast path.

### 12.1 Agent roles

Implemented with **Vercel AI SDK tool-loop agent**. One `streamText` call per user turn, provider-routed through **OpenRouter**. Loop stops when the model calls `emit_artifact` or hits `stepCountIs(12)` as a hard cap. Tools exposed to the loop:

| Tool | Backing | Purpose |
|---|---|---|
| `search_components` | Component-library MCPs (shadcn, Radix, Material, Chakra, HeroUI, Tailwind UI catalogs) OR a single **Apify MCP** aggregating scrapers | Find components matching concept (e.g. "pricing card", "glassy hero") |
| `search_pinterest` | **Apify Pinterest scraper** via Apify MCP | Pull reference images for concept (e.g. "fintech mobile app onboarding") |
| `fetch_image` | HTTP | Download reference images |
| `interpret_image` | Nested `generateObject` call with Claude vision via OpenRouter + design-language schema (zod) | Return structured description: layout grid, palette, type pairing, spacing rhythm, motif keywords, component archetypes |
| `synthesize_concept` | Nested `generateObject` call | Merge user concept + interpreted references → unique design brief (not a copy) |
| `emit_artifact` | Terminal tool — returns HTML + sidecar JSON; loop stops on this tool | Produce final artifact per §6.3 contract |
| `apply_design_system` | Local | Inject brand tokens (if project has a `DesignSystem`) before `emit_artifact` |

### 12.2 Flows

**First-time generation (full pipeline)**
1. User submits concept prompt + target type (website / mobile / slides / carousel / wireframe).
2. Agent plans: decides how many references to pull (default 4–6) and what component categories to search.
3. Parallel tool calls: `search_pinterest` + `search_components`.
4. `fetch_image` for top N Pinterest results. `interpret_image` on each → structured design-language notes.
5. `synthesize_concept` merges all notes + user concept → unique brief: palette hex values, type pairing, grid, motifs, component plan. Brief is deliberately a *synthesis*, never a 1:1 copy of a single reference.
6. `apply_design_system` if project has one (tokens override palette/type from brief).
7. `emit_artifact` with brief + chosen components → HTML + sidecar JSON.
8. Persist: `Call` row per tool use, references saved to `Inspiration { artifactId, imageUrl, source, notesJson }`.

**Follow-up refinement (fast path)**
1. User sends follow-up ("make it dark mode", comment, slider change).
2. Agent **skips** research tools. Straight to `emit_artifact` with prior artifact + new instruction as context.
3. Research re-triggers only if user explicitly changes concept ("actually make it a SaaS landing, not meditation").

### 12.3 Output types (target artifact)

Each type has its own system-prompt preset + emit contract:

| Type | Output | Viewport preset |
|---|---|---|
| **Website** | Single `<html>` long-scroll page | 1440 desktop + responsive |
| **Mobile app** | `<html>` with phone-frame wrapper, multiple screens as sections | 390×844 |
| **Slides (PPT-style)** | `<html>` deck, each slide a 16:9 section with page break markers | 1920×1080 per slide |
| **Carousel** | `<html>` sequence of square or 4:5 frames (IG/LinkedIn) | 1080×1080 / 1080×1350 |
| **Wireframe** | `<html>` grayscale low-fi, monospace labels, no imagery | matches chosen form factor |

Type chosen at project creation + switchable mid-project ("remake as slides"). Each type ships its own few-shot examples in the agent's system prompt.

### 12.4 Why Apify

- Pinterest has no public API for this use case → Apify maintains a scraper that keeps working as Pinterest changes.
- Apify MCP server lets one tool call cover many scrapers (Pinterest, Dribbble, Behance, Awwwards) without wiring each individually.
- Costs per run, not per seat. Sensible for a research preview.

### 12.5 Safety / IP

- References are for **inspiration, not reproduction**. `synthesize_concept` step explicitly disallows 1:1 copying; logs the reference URLs + the novel choices.
- Store inspiration URLs with every artifact so users can audit sources.
- Rate-limit Apify actors to avoid abuse.

## 13. Sources

- [Introducing Claude Design — Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs)
- [Anthropic launches Claude Design — TechCrunch](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/)
- [Claude Design launch — VentureBeat](https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma)
- [Canva + Anthropic — The Next Web](https://thenextweb.com/news/canva-anthropic-claude-design-ai-powered-visual-suite)
