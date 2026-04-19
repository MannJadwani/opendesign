function safeStringify(v: unknown) {
  try {
    const s = JSON.stringify(v, null, 2) ?? String(v);
    return s.length > 4000 ? s.slice(0, 4000) + "\n…" : s;
  } catch {
    return String(v);
  }
}

export function JSONBlock({ label, data }: { label: string; data: unknown }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[#9A9389]">{label}</div>
      <pre className="max-h-48 overflow-auto rounded-md bg-[#F5F0E8] px-2 py-1.5 text-[11px] leading-snug text-[#3D3831]">
        {safeStringify(data)}
      </pre>
    </div>
  );
}
