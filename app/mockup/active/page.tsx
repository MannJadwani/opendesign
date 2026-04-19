import { Preview } from "./preview";

export default function ActiveMockup() {
  return (
    <div
      className="flex h-screen flex-col bg-[#E8E0D0] text-[#1F1B16]"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <TopBar />
      <main className="grid flex-1 grid-cols-[380px_1fr] overflow-hidden">
        <ChatPane />
        <CanvasPane />
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TOP BAR                                                            */
/* ------------------------------------------------------------------ */

function TopBar() {
  return (
    <header className="flex items-center justify-between bg-[#E8E0D0] px-3 py-2">
      <div className="flex items-center gap-2">
        <Brand />
        <span className="mx-1 h-5 w-px bg-black/10" />
        <IconButton><HomeIcon /></IconButton>
        <Tab active>Chat</Tab>
        <Tab>Comments</Tab>
        <IconButton><PlusIcon /></IconButton>
      </div>

      <div className="flex items-center gap-2">
        <ProjectBadge />
        <OutputTypePicker />
      </div>

      <div className="flex items-center gap-1.5">
        <DropdownButton label="Share" />
        <button className="rounded-lg bg-[#1F1B16] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-black">
          Export
        </button>
        <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-[12px] font-semibold">
          M
        </div>
      </div>
    </header>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-1.5 px-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1F1B16] text-[11px] font-bold text-[#F5F0E8]">
        O
      </span>
      <span
        className="text-[17px] leading-none tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Open<span className="italic text-[#D9623A]">Design</span>
      </span>
    </div>
  );
}

function ProjectBadge() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px]">
      <span className="h-2 w-2 rounded-full bg-[#6FA772]" />
      <span className="font-medium">stilla — meditation app</span>
      <span className="text-[#8A8278]">·</span>
      <span className="text-[12px] text-[#6B655D]">auto-saved</span>
    </div>
  );
}

const OUTPUT_TYPES = [
  { label: "Website", icon: <GlobeIcon /> },
  { label: "Mobile", icon: <PhoneIcon /> },
  { label: "Slides", icon: <DeckIcon /> },
  { label: "Carousel", icon: <CarouselIcon /> },
  { label: "Wireframe", icon: <WireIcon /> },
];

function OutputTypePicker() {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-black/10 bg-white p-0.5">
      {OUTPUT_TYPES.map((t, i) => (
        <button
          key={t.label}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
            i === 0 ? "bg-[#1F1B16] text-white" : "text-[#6B655D] hover:bg-black/5 hover:text-[#1F1B16]"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Tab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`relative px-3 py-1.5 text-[14px] ${
        active ? "font-semibold text-[#1F1B16]" : "font-medium text-[#6B655D] hover:text-[#1F1B16]"
      }`}
    >
      {children}
      {active && <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#1F1B16]" />}
    </button>
  );
}

function IconButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B655D] hover:bg-black/5 hover:text-[#1F1B16]">
      {children}
    </button>
  );
}

function DropdownButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium hover:bg-[#FAF6EF]">
      {label}
      <Chev />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT PANE                                                          */
/* ------------------------------------------------------------------ */

function ChatPane() {
  return (
    <aside className="relative ml-3 mt-3 flex flex-col overflow-hidden rounded-tr-2xl border border-black/5 bg-[#F5F0E8]">
      <ChatHeader />
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
        <UserTurn
          text="Create a serene mobile meditation app — calming type, nature-tuned colors, clean layout."
          attachments={[{ name: "inspiration.png", kind: "image" }]}
        />
        <ThinkingRow label="Thought for 9 seconds" />
        <ToolRow icon={<PinterestIcon />} label="search_pinterest · 'meditation app minimal'" meta="12 results" avatars />
        <ToolRow icon={<ComponentIcon />} label="search_components · shadcn, Radix" meta="6 matches" />
        <ToolRow icon={<EyeIcon />} label="interpret_image · 4 refs" />
        <ToolRow icon={<SparklesIcon />} label="synthesize_concept" />
        <ToolRow icon={<SwatchIcon />} label="apply_design_system · Stilla System" />
        <ToolRow icon={<BoltIcon />} label="emit_artifact" final />
        <AssistantBlock />
        <InsertRow />

        <UserTurn text="bigger hero padding + add a dark mode toggle" />
        <ToolRow icon={<BoltIcon />} label="emit_artifact (follow-up, research skipped)" final />
        <AssistantAck />
      </div>
      <Composer />
    </aside>
  );
}

function ChatHeader() {
  return (
    <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
      <button
        className="flex items-center gap-1.5 text-[14px] font-semibold tracking-tight"
      >
        New AI Chat
        <Chev />
      </button>
      <div className="flex items-center gap-2">
        <DSBadge />
        <IconBtnSm><PencilIcon /></IconBtnSm>
        <IconBtnSm><PanelIcon /></IconBtnSm>
      </div>
    </div>
  );
}

function DSBadge() {
  return (
    <button className="flex items-center gap-1 rounded-full border border-[#D9623A]/30 bg-[#FDEFE8] px-2 py-1 text-[11px] font-semibold text-[#D9623A]">
      <SwatchIcon />
      Stilla System
      <CheckIcon />
    </button>
  );
}

function UserTurn({
  text,
  attachments,
}: {
  text: string;
  attachments?: { name: string; kind: "image" | "file" }[];
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      {attachments && (
        <div className="flex flex-wrap justify-end gap-1.5">
          {attachments.map((a) => (
            <span
              key={a.name}
              className="inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 py-1 text-[11px] font-medium"
            >
              {a.kind === "image" ? <ImageIcon /> : <FileIcon />}
              {a.name}
            </span>
          ))}
        </div>
      )}
      <div className="max-w-[92%] rounded-2xl bg-white px-3.5 py-2 text-[14px] leading-relaxed text-[#1F1B16] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/5">
        {text}
      </div>
    </div>
  );
}

function ThinkingRow({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 text-[12.5px] text-[#6B655D] hover:text-[#1F1B16]">
      <BulbIcon />
      <span>{label}</span>
      <ChevRight />
    </button>
  );
}

function ToolRow({
  icon,
  label,
  meta,
  avatars,
  final,
}: {
  icon: React.ReactNode;
  label: string;
  meta?: string;
  avatars?: boolean;
  final?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-[12.5px] ${
        final ? "font-semibold text-[#D9623A]" : "text-[#6B655D]"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white ring-1 ring-black/10">
        {icon}
      </span>
      <span className="font-mono tracking-tight">{label}</span>
      {meta && <span className="text-[#8A8278]">· {meta}</span>}
      {avatars && <SourceAvatars />}
    </div>
  );
}

function SourceAvatars() {
  return (
    <span className="ml-1 flex -space-x-1.5">
      <span className="h-4 w-4 rounded-sm bg-[#E8D4C6] ring-1 ring-white" />
      <span className="h-4 w-4 rounded-sm bg-[#CFD9F5] ring-1 ring-white" />
      <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#1F1B16] text-[8px] font-bold text-white ring-1 ring-white">
        +9
      </span>
    </span>
  );
}

function AssistantBlock() {
  return (
    <div className="space-y-2.5 text-[14px] leading-relaxed text-[#1F1B16]">
      <p>
        Here's the brief I synthesized from your references and the Stilla System
        tokens:
      </p>
      <ul className="list-disc space-y-1.5 pl-5 text-[#3D3831]">
        <li>Moss + sage palette, cream base; no saturated accents.</li>
        <li>Serif display paired with a humanist sans; 72px section rhythm.</li>
        <li>Motion ≤200ms, eased-out — timers fade, never ring.</li>
      </ul>
      <p className="text-[13px] text-[#6B655D]">
        4 inspiration URLs saved to the project.
      </p>
    </div>
  );
}

function AssistantAck() {
  return (
    <div className="text-[14px] leading-relaxed text-[#1F1B16]">
      Updated hero padding to 96px and wired a dark-mode toggle in the nav.
      Patched element <code className="rounded bg-white px-1 py-0.5 font-mono text-[12px] ring-1 ring-black/10">data-cd-id=hero</code>.
    </div>
  );
}

function InsertRow() {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#6B655D] hover:text-[#1F1B16]">
        <ArrowUpLeft /> Insert
      </button>
      <div className="flex items-center gap-0.5 text-[#8A8278]">
        <IconBtnSm><CopyIcon /></IconBtnSm>
        <IconBtnSm><ThumbUp /></IconBtnSm>
        <IconBtnSm><ThumbDown /></IconBtnSm>
        <IconBtnSm><RefreshIcon /></IconBtnSm>
      </div>
    </div>
  );
}

/* ---------- composer w/ model selector ---------- */

function Composer() {
  return (
    <div className="m-4 rounded-2xl border border-black/10 bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <ContextChip icon={<StarIcon />} label="Animated video" removable />
        <ContextChip icon={<SwatchIcon />} label="Stilla System" />
      </div>
      <input
        placeholder="Refine the design, or describe a new direction..."
        className="w-full bg-transparent py-1 text-[15px] placeholder:text-[#9A9389] focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          <IconBtnSm><PaperclipIcon /></IconBtnSm>
          <IconBtnSm><WaveIcon /></IconBtnSm>
          <ModelSelector />
        </div>
        <button className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#D9623A] px-3.5 py-1.5 text-[13px] font-medium text-white shadow-[0_1px_0_rgba(0,0,0,0.08)] hover:brightness-105">
          <SendIcon />
          Send
        </button>
      </div>
    </div>
  );
}

function ContextChip({
  icon,
  label,
  removable,
}: {
  icon: React.ReactNode;
  label: string;
  removable?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#F5F0E8] px-2.5 py-1 text-[12px] font-medium text-[#3D3831]">
      {icon}
      {label}
      {removable && (
        <button className="ml-0.5 text-[#8A8278] hover:text-[#1F1B16]">
          <XMini />
        </button>
      )}
    </span>
  );
}

function ModelSelector() {
  return (
    <button
      className="ml-1 flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[12px] font-medium hover:bg-[#FAF6EF]"
      title="Opus 4.7 via OpenRouter"
    >
      <span className="text-[#D9623A]">
        <Sparkle2 />
      </span>
      <span>Opus 4.7</span>
      <Chev />
    </button>
  );
}

function IconBtnSm({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B655D] hover:bg-black/5 hover:text-[#1F1B16]">
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  CANVAS PANE                                                        */
/* ------------------------------------------------------------------ */

function CanvasPane() {
  return (
    <section
      className="relative mt-3 flex flex-col overflow-hidden rounded-tl-2xl border border-black/5 bg-white"
      style={{
        backgroundImage: "radial-gradient(circle, #E4DED3 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <CanvasToolbar />
      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1 px-8 py-5">
          <div className="relative h-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)]">
            <Preview />
            <CommentPin n={1} top="5%" left="4%" text="too cramped — more breathing room" />
            <SelectionHandles />
          </div>
        </div>
        <Inspector />
      </div>
      <VariantsStrip />
    </section>
  );
}

function CanvasToolbar() {
  return (
    <div className="relative z-10 flex items-center gap-3 border-b border-black/5 bg-white/80 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <IconBtnSm><UpArrow /></IconBtnSm>
        <IconBtnSm><RefreshIcon /></IconBtnSm>
        <span className="ml-1 whitespace-nowrap text-[13px] text-[#6B655D]">
          stilla / <span className="font-medium text-[#1F1B16]">home-v3</span>
        </span>
      </div>

      <div className="mx-auto flex items-center gap-2">
        <ViewportToggle />
        <ModeToggle />
      </div>

      <div className="flex items-center gap-1.5">
        <TextIconBtn icon={<SketchIcon />}>New sketch</TextIconBtn>
        <TextIconBtn icon={<ClipIcon />}>Paste</TextIconBtn>
      </div>
    </div>
  );
}

function TextIconBtn({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#3D3831] hover:bg-black/5">
      <span className="text-[#D9623A]">{icon}</span>
      {children}
    </button>
  );
}

function ViewportToggle() {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-black/10 bg-white p-0.5">
      {[
        { w: "1440", active: true },
        { w: "768" },
        { w: "390" },
      ].map((v) => (
        <button
          key={v.w}
          className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
            v.active ? "bg-[#1F1B16] text-white" : "text-[#6B655D] hover:bg-black/5"
          }`}
        >
          {v.w}
        </button>
      ))}
    </div>
  );
}

function ModeToggle() {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-black/10 bg-white p-0.5">
      {[
        { label: "Preview", icon: <EyeIcon />, active: true },
        { label: "Select", icon: <CursorIcon /> },
        { label: "Comment", icon: <CommentIcon /> },
      ].map((m) => (
        <button
          key={m.label}
          className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
            m.active ? "bg-[#1F1B16] text-white" : "text-[#6B655D] hover:bg-black/5"
          }`}
        >
          {m.icon}
          {m.label}
        </button>
      ))}
    </div>
  );
}

function CommentPin({
  n,
  top,
  left,
  text,
}: {
  n: number;
  top: string;
  left: string;
  text: string;
}) {
  return (
    <div className="pointer-events-none absolute flex items-start gap-2" style={{ top, left }}>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D9623A] text-[10px] font-bold text-white ring-2 ring-white">
        {n}
      </div>
      <div className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#1F1B16] ring-1 ring-black/10 shadow-sm">
        {text}
      </div>
    </div>
  );
}

function SelectionHandles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-sm outline outline-2 outline-[#D9623A]"
      style={{ top: "28%", left: "6%", width: "44%", height: "28%" }}
    >
      {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((p, i) => (
        <span
          key={i}
          className={`absolute h-2 w-2 rounded-sm bg-white ring-2 ring-[#D9623A] ${p}`}
        />
      ))}
      <span className="absolute -top-6 left-0 rounded bg-[#D9623A] px-1.5 py-0.5 text-[10px] font-semibold text-white">
        h1.hero-title · data-cd-id=hero-title
      </span>
    </div>
  );
}

/* ---------- inspector ---------- */

function Inspector() {
  return (
    <aside className="relative z-10 w-[240px] shrink-0 overflow-y-auto border-l border-black/5 bg-white/75 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6B655D]">
          Inspector
        </h3>
        <IconBtnSm><CollapseIcon /></IconBtnSm>
      </div>

      <div className="space-y-5 px-4 py-4">
        <InspectorSection title="Selected element">
          <div className="flex items-center justify-between rounded-lg bg-[#F5F0E8] px-3 py-2 text-[12px]">
            <span className="font-mono text-[#1F1B16]">h1.hero-title</span>
            <span className="text-[#8A8278]">data-cd-id=hero-title</span>
          </div>
        </InspectorSection>

        <InspectorSection title="Adjustable" subtitle="Claude-emitted controls">
          <Slider label="Hero padding" value="96px" min={24} max={160} progress={0.6} />
          <Slider label="Line height" value="1.05" min={0.9} max={1.6} progress={0.28} />
          <Slider label="Font size" value="52px" min={32} max={96} progress={0.5} />
        </InspectorSection>

        <InspectorSection title="Palette">
          <div className="flex gap-1.5">
            {["#6FA772", "#E3F0DC", "#F4F8F2", "#2A3A2B", "#D9623A"].map((c) => (
              <button
                key={c}
                className="h-7 w-7 rounded-md ring-1 ring-black/10"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </InspectorSection>

        <InspectorSection title="Comments" subtitle="1 open">
          <div className="rounded-lg border border-black/10 bg-white p-2.5 text-[12px]">
            <div className="flex items-center gap-1.5 text-[#6B655D]">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#D9623A] text-[9px] font-bold text-white">
                1
              </span>
              <span className="font-medium text-[#1F1B16]">hero</span>
              <span className="ml-auto text-[10px]">just now</span>
            </div>
            <p className="mt-1.5 text-[#3D3831]">too cramped — more breathing room</p>
            <button className="mt-2 text-[11px] font-semibold text-[#D9623A] hover:underline">
              Apply with Claude →
            </button>
          </div>
        </InspectorSection>
      </div>
    </aside>
  );
}

function InspectorSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6B655D]">
          {title}
        </h4>
        {subtitle && <span className="text-[10px] text-[#8A8278]">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  progress: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[#3D3831]">{label}</span>
        <span className="font-mono text-[#1F1B16]">{value}</span>
      </div>
      <div className="relative h-1 rounded-full bg-[#EDE6D9]">
        <div
          className="absolute left-0 top-0 h-1 rounded-full bg-[#1F1B16]"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#1F1B16] bg-white shadow"
          style={{ left: `calc(${progress * 100}% - 6px)` }}
        />
      </div>
    </div>
  );
}

/* ---------- variants strip ---------- */

function VariantsStrip() {
  const variants = [
    { name: "moss", bg: "#DFF0DA", accent: "#6FA772", main: true },
    { name: "peach", bg: "#FDE2D1", accent: "#D9623A" },
    { name: "mauve", bg: "#E7D7F2", accent: "#A070C0" },
    { name: "ivory", bg: "#FBEBC6", accent: "#C9A520" },
  ];
  return (
    <div className="relative z-10 flex items-center justify-between border-t border-black/5 bg-white/80 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6B655D]">
          Variants
        </span>
        <div className="flex gap-1.5">
          {variants.map((v) => (
            <button
              key={v.name}
              className={`relative h-10 w-20 overflow-hidden rounded-lg border ${
                v.main ? "border-[#1F1B16] ring-2 ring-[#1F1B16]/10" : "border-black/10"
              }`}
              style={{ background: v.bg }}
            >
              <span
                className="absolute bottom-1 left-1 h-3.5 w-8 rounded-md"
                style={{ background: v.accent }}
              />
              {v.main && (
                <span className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#1F1B16]">
                  main
                </span>
              )}
            </button>
          ))}
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-black/15 text-[#8A8278] hover:border-[#D9623A] hover:text-[#D9623A]">
            <PlusIcon />
          </button>
        </div>
      </div>

      <button className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium hover:bg-[#FAF6EF]">
        <SparklesIcon />
        Explore alternatives
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ICONS                                                              */
/* ------------------------------------------------------------------ */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="M3 11 12 3l9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-9Z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function Chev() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ChevRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}
function DeckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}
function CarouselIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <rect x="8" y="4" width="8" height="16" rx="1.5" />
      <path d="M4 7v10M20 7v10" />
    </svg>
  );
}
function WireIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 8h18M7 12h6M7 16h10" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function PanelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}
function PinterestIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
function ComponentIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function SparklesIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8" />
    </svg>
  );
}
function Sparkle2() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 14 10 22 12 14 14 12 22 10 14 2 12 10 10Z" />
    </svg>
  );
}
function SwatchIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" {...stroke}>
      <path d="M3 17a4 4 0 1 0 8 0V5a2 2 0 0 0-4 0" />
      <path d="M7 17h4" />
      <path d="m13 13 5-5a2 2 0 0 1 3 3l-5 5" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" {...stroke}>
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m3 17 5-5 4 4 3-3 6 6" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
      <path d="M14 3v6h6" />
    </svg>
  );
}
function BulbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2Z" />
    </svg>
  );
}
function ArrowUpLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" {...stroke}>
      <path d="M17 17 7 7M7 17V7h10" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function ThumbUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7V10l5-8c.83 0 1.5.67 1.5 1.5v2.38Z" />
    </svg>
  );
}
function ThumbDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17v12l-5 8c-.83 0-1.5-.67-1.5-1.5v-2.38Z" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" {...stroke}>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" {...stroke}>
      <path d="m12 3 2.6 6 6.4.6-5 4.4 1.5 6.4L12 17l-5.5 3.4L8 14 3 9.6 9.4 9 12 3Z" />
    </svg>
  );
}
function XMini() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" {...stroke}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82 2 2 0 1 1-2.83 2.83 1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0 1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33 2 2 0 1 1-2.83-2.83 1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4 1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82 2 2 0 1 1 2.83-2.83 1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0 1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33 2 2 0 1 1 2.83 2.83 1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4 1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
function PaperclipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
function WaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 12h2M8 7v10M12 4v16M16 8v8M20 12h-2" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 12 22 3l-6 19-4-8-9-2Z" />
    </svg>
  );
}
function UpArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function SketchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function ClipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}
function CursorIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <path d="M13 13 6 3l10 7-3.5 1L11 17l-3-2 1-2h1Z" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  );
}
function CollapseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
