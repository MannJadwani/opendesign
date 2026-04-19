import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mockup",
  robots: { index: false, follow: false },
};

export default function MockupPage() {
  return (
    <div className="flex h-screen flex-col bg-[#E8E0D0] text-[#1F1B16]" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <TopBar />
      <main className="grid flex-1 grid-cols-[380px_1fr] overflow-hidden">
        <ChatPane />
        <CanvasPane />
      </main>
    </div>
  );
}

/* ---------- top bar ---------- */

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
      <div className="flex items-center gap-1.5">
        <PillButton>Share</PillButton>
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
        className="text-[17px] leading-none tracking-tight text-[#1F1B16]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Open<span className="italic text-[#D9623A]">Design</span>
      </span>
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
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#1F1B16]" />
      )}
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

function PillButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-lg border border-black/10 bg-white px-3.5 py-1.5 text-[13px] font-medium hover:bg-[#FAF6EF]">
      {children}
    </button>
  );
}

/* ---------- chat pane ---------- */

function ChatPane() {
  return (
    <aside className="relative ml-3 mt-3 flex flex-col overflow-hidden rounded-tr-2xl border border-black/5 bg-[#F5F0E8]">
      <div className="flex flex-1 flex-col items-center justify-center px-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h1
              className="text-[34px] leading-none tracking-tight text-[#1F1B16]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Start with context
            </h1>
            <p className="text-[14px] leading-relaxed text-[#6B655D]">
              Designs grounded in real context turn out better.
            </p>
          </div>

          <div className="space-y-2.5">
            <ContextPill icon={<BookIcon />} label="Design System" />
            <ContextPill icon={<ImageIcon />} label="Add screenshot" />
            <ContextPill icon={<FigmaIcon />} label="Drag in a Figma file" trailing={<HelpIcon />} />
          </div>
        </div>
      </div>

      <Composer />
    </aside>
  );
}

function ContextPill({
  icon,
  label,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2.5 text-left text-[14px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#FAF6EF]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FDEFE8] text-[#D9623A]">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {trailing && <span className="text-[#B8B1A6]">{trailing}</span>}
    </button>
  );
}

function Composer() {
  return (
    <div className="m-4 rounded-2xl border border-black/10 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mb-2.5 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#F5F0E8] px-2.5 py-1 text-[12px] font-medium text-[#3D3831]">
          <StarIcon />
          Animated video
          <button className="ml-0.5 text-[#8A8278] hover:text-[#1F1B16]">
            <XMini />
          </button>
        </span>
      </div>
      <input
        placeholder="Describe what you want to create..."
        className="w-full bg-transparent py-1 text-[15px] placeholder:text-[#9A9389] focus:outline-none"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <IconBtnSm><GearIcon /></IconBtnSm>
          <IconBtnSm><WaveIcon /></IconBtnSm>
          <button className="ml-1 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium hover:bg-[#FAF6EF]">
            Import
          </button>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-[#D9623A] px-3.5 py-1.5 text-[13px] font-medium text-white shadow-[0_1px_0_rgba(0,0,0,0.08)] hover:brightness-105">
          <SendIcon />
          Send
        </button>
      </div>
    </div>
  );
}

function IconBtnSm({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B655D] hover:bg-black/5 hover:text-[#1F1B16]">
      {children}
    </button>
  );
}

/* ---------- canvas pane ---------- */

function CanvasPane() {
  return (
    <section
      className="relative mt-3 flex flex-col overflow-hidden rounded-tl-2xl border border-black/5 bg-white"
      style={{
        backgroundImage:
          "radial-gradient(circle, #E4DED3 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="relative z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium">
            <FolderIcon /> Design Files
          </button>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1.5">
          <IconBtnSm><UpArrow /></IconBtnSm>
          <IconBtnSm><RefreshIcon /></IconBtnSm>
          <span className="ml-1 text-[13px] text-[#6B655D]">project</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TextIconBtn icon={<SketchIcon />}>New sketch</TextIconBtn>
          <TextIconBtn icon={<ClipIcon />}>Paste</TextIconBtn>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <h2
            className="text-[34px] italic tracking-tight text-[#1F1B16]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Creations will appear here
          </h2>
          <button className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[14px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#FAF6EF]">
            <PencilIcon /> Start with a sketch
          </button>
        </div>
      </div>

      <div className="relative z-10 border-t border-black/5 bg-white/70 px-8 py-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6B655D]">
          <UploadIcon />
          Drop files here
        </div>
        <p className="mt-1.5 text-[15px] text-[#1F1B16]">
          Images, docs, references, Figma links, or folders — OpenDesign will use them as context.
        </p>
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#D6CEC0]" />
      </div>
    </section>
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

/* ---------- icons ---------- */

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
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 1 4 17.5v-13Z" />
      <path d="M4 17.5A1.5 1.5 0 0 1 5.5 16H19M8 7h7" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m3 17 5-5 4 4 3-3 6 6" />
    </svg>
  );
}
function FigmaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M9 3h6a3 3 0 0 1 0 6H9a3 3 0 0 1 0-6Z" />
      <path d="M9 9h6a3 3 0 0 1 0 6H9a3 3 0 0 1 0-6Z" />
      <path d="M9 15a3 3 0 1 0 3 3v-3H9Z" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.5c-1 .5-1 1.5-1 2M12 17h.01" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
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
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
function WaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
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
function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}
function UpArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
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
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" {...stroke}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}
